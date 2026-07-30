import type { NotificationMinute } from './streamSession'

export type StreamPreset = {
  id: string
  name: string
  title: string
  streamUrl: string
  hashtags: string
  notificationsEnabled: boolean
  notificationMinutes: NotificationMinute[]
}