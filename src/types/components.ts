import type { PortalTopic } from "./prototype";

export type Navigate = (path: string) => void;
export type ShowToast = (message: string) => void;

export type NavigationProps = {
  navigate: Navigate;
};

export type ToastProps = {
  showToast: ShowToast;
};

export type PageActionProps = NavigationProps & ToastProps;

export type HeaderPageProps = {
  title: string;
  desc?: string;
};

export type LoadingIndicatorProps = {
  label: string;
};

export type NavbarProps = PageActionProps & {
  currentPath: string;
  currentDate: string;
  isNavbarScrolled?: boolean;
  searchDialogOpen?: boolean;
};

export type NavBottomProps = PageActionProps & {
  currentPath: string;
};

export type SearchDialogProps = NavigationProps & {
  open?: boolean;
};

export type PortalNetworkProps = NavigationProps & {
  topics: PortalTopic[];
};

export type StatisticsPageProps = NavigationProps;
export type MubaMapProps = NavigationProps & {
  activeKecamatan?: string | null;
  compact?: boolean;
};

export type KecamatanStatisticsPageProps = NavigationProps & {
  currentPath: string;
};
