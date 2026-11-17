import { animate, cubicBezier, hover, inView, press } from "motion";
import type { AnimationPlaybackControlsWithThen } from "motion";
import type { Attachment } from "svelte/attachments";
import { MediaQuery } from "svelte/reactivity";
import type { TransitionConfig } from "svelte/transition";

const reducedMotion = new MediaQuery("(prefers-reduced-motion: reduce)");
const ease = cubicBezier(0.22, 1, 0.36, 1);

export function reveal(delay = 0): Attachment<HTMLElement> {
  let revealed = false;

  return (node) => {
    if (reducedMotion.current || revealed) {
      revealed = true;
      return;
    }

    let animation: AnimationPlaybackControlsWithThen | undefined;
    const opacity = node.style.opacity;
    const transform = node.style.transform;
    node.style.opacity = "0";

    const restore = () => {
      animation?.cancel();
      node.style.opacity = opacity;
      node.style.transform = transform;
    };
    const showOnFocus = () => {
      revealed = true;
      stopObserving();
      restore();
    };
    const stopObserving = inView(node, () => {
      if (revealed) return;
      revealed = true;
      animation = animate(node, { opacity: [0, 1], y: [14, 0] }, {
        duration: 0.42,
        delay,
        ease,
        onComplete: restore,
      });
    });
    node.addEventListener("focusin", showOnFocus);

    return () => {
      stopObserving();
      node.removeEventListener("focusin", showOnFocus);
      restore();
    };
  };
}

export function interactive(lift = 0): Attachment<HTMLElement> {
  return (node) => {
    if (reducedMotion.current) return;

    let hovered = false;
    let animation: AnimationPlaybackControlsWithThen | undefined;
    const transform = node.style.transform;
    const disabled = () => node.matches(":disabled, [aria-disabled='true']");
    const move = (scale: number, y: number) => {
      animation = animate(node, { scale, y }, {
        type: "spring",
        stiffness: 450,
        damping: 30,
      });
    };
    const stopHover = lift ? hover(node, () => {
      if (disabled()) return;
      hovered = true;
      move(1, -lift);
      return () => {
        hovered = false;
        move(1, 0);
      };
    }) : () => {};
    const stopPress = press(node, () => {
      if (disabled()) return;
      move(0.98, 0);
      return () => move(1, hovered ? -lift : 0);
    });

    return () => {
      stopHover();
      stopPress();
      animation?.cancel();
      node.style.transform = transform;
    };
  };
}

export function pageFade(_node: Element): TransitionConfig {
  return {
    duration: reducedMotion.current ? 0 : 180,
    easing: ease,
    css: (t) => `opacity: ${t}`,
  };
}

export function menuTransition(_node: Element): TransitionConfig {
  return {
    duration: reducedMotion.current ? 0 : 180,
    easing: ease,
    css: (t) => `opacity: ${t}; transform: translateY(${(1 - t) * -6}px)`,
  };
}
