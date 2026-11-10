import type { ScheduledActivity } from "../types/activities";

export function getHomeAgenda(activities: ScheduledActivity[], date: string) {
  return {
    upcoming: activities.filter((activity) => activity.endDate >= date).sort((a, b) => a.startDate.localeCompare(b.startDate)),
    recent: activities.filter((activity) => activity.endDate < date).sort((a, b) => b.endDate.localeCompare(a.endDate)),
  };
}
