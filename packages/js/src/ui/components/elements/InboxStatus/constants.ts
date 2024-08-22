import type { LocalizationKey, NotificationStatus } from '../../../types';

export const notificationStatusOptionsLocalizationKeys = {
  all: 'inbox.filters.dropdownOptions.all',
  unread: 'inbox.filters.dropdownOptions.unread',
  archived: 'inbox.filters.dropdownOptions.archived',
} as const satisfies Record<NotificationStatus, LocalizationKey>;

export const inboxFilterLocalizationKeys = {
  all: 'inbox.filters.labels.all',
  unread: 'inbox.filters.labels.unread',
  archived: 'inbox.filters.labels.archived',
} as const satisfies Record<NotificationStatus, LocalizationKey>;
