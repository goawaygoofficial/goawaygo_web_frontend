import type { LucideIcon } from 'lucide-react';

/** One row of the destination info list. */
export interface DestinationInfoItem {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}
