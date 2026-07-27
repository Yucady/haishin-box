export type NotificationPermissionState =
  | NotificationPermission
  | 'unsupported';

export const getNotificationPermission =
  (): NotificationPermissionState => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    return Notification.permission;
  };

export const requestNotificationPermission =
  async (): Promise<NotificationPermissionState> => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    return Notification.requestPermission();
  };

export const showBrowserNotification = async (
  title: string,
  options: NotificationOptions = {},
): Promise<boolean> => {
  if (getNotificationPermission() !== 'granted') {
    return false;
  }

  const notificationOptions: NotificationOptions = {
    icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
    ...options,
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration =
        await navigator.serviceWorker.getRegistration();

      if (registration) {
        await registration.showNotification(
          title,
          notificationOptions,
        );

        return true;
      }
    }

    new Notification(title, notificationOptions);
    return true;
  } catch {
    return false;
  }
};