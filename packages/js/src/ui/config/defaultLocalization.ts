export const defaultLocalization = {
  locale: 'en-US',
  'inbox.filters.dropdownOptions.unread': 'Unread only',
  'inbox.filters.dropdownOptions.all': 'Unread & read',
  'inbox.filters.dropdownOptions.archived': 'Archived',
  'inbox.filters.labels.unread': 'Unread',
  'inbox.filters.labels.all': 'Inbox',
  'inbox.filters.labels.archived': 'Archived',
  'notifications.emptyNotice': 'No notifications',
  'notifications.actions.readAll': 'Mark all as read',
  'notifications.actions.archiveAll': 'Archive all',
  'notifications.actions.archiveRead': 'Archive read',
  'notifications.newNotifications': ({ notificationCount }: { notificationCount: number }) =>
    `${notificationCount > 99 ? '99+' : notificationCount} new ${
      notificationCount === 1 ? 'notification' : 'notifications'
    }`,
  'notification.actions.read.toolTip': 'Mark as read',
  'notification.actions.unread.toolTip': 'Mark as unread',
  'notification.actions.archive.toolTip': 'Archive',
  'notification.actions.unarchive.toolTip': 'Unarchive',
  'preferences.title': 'Notification Preferences',
  'preferences.global': 'Global Preferences',
  'preferences.workflow.disabled.notice':
    'Contact admin to enable subscription management for this critical notification.',
  'preferences.workflow.disabled.tooltip': 'Contact admin to edit',
} as const;
