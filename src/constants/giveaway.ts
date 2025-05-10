import { GiveawayStatus } from '@/types/giveaway';

export const GIVEAWAY_STATUS_LABELS = {
  [GiveawayStatus.DRAFT]: 'Draft',
  [GiveawayStatus.SCHEDULED]: 'Scheduled',
  [GiveawayStatus.ACTIVE]: 'Active',
  [GiveawayStatus.COMPLETED]: 'Completed',
  [GiveawayStatus.CANCELED]: 'Canceled',
};

export const GIVEAWAY_STATUS_COLORS = {
  [GiveawayStatus.DRAFT]: 'gray',
  [GiveawayStatus.SCHEDULED]: 'blue',
  [GiveawayStatus.ACTIVE]: 'green',
  [GiveawayStatus.COMPLETED]: 'purple',
  [GiveawayStatus.CANCELED]: 'red',
};

export const GIVEAWAY_VALIDATION = {
  TITLE_MIN: 3,
  TITLE_MAX: 100,
  KEYWORD_MIN: 1,
  KEYWORD_MAX: 50,
  DESCRIPTION_MAX: 500,
};
