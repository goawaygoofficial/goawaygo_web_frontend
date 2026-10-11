import type { IconName } from '@/components';

/** One row of the destination info list. */
export interface DestinationInfoItem {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
}
