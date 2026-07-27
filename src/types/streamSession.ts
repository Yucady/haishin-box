export type StreamStatus = 'preparing' | 'live' | 'ended';

export const NOTIFICATION_MINUTE_OPTIONS = [30, 10, 5] as const;

export type NotificationMinute =
  (typeof NOTIFICATION_MINUTE_OPTIONS)[number];

export type StreamSession = {
  title: string;
  scheduledAt: string;
  streamUrl: string;
  hashtags: string;
  status: StreamStatus;
  notificationsEnabled: boolean;
  notificationMinutes: NotificationMinute[];
  notifiedMinutes: NotificationMinute[];
};

export const createEmptyStreamSession = (): StreamSession => ({
  title: '',
  scheduledAt: '',
  streamUrl: '',
  hashtags: '',
  status: 'preparing',
  notificationsEnabled: false,
  notificationMinutes: [...NOTIFICATION_MINUTE_OPTIONS],
  notifiedMinutes: [],
});