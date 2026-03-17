/// <reference lib="webworker" />

/** Default options merged into every showNotification call. */
export const DEFAULT_NOTIFICATION_OPTIONS: NotificationOptions & { vibrate?: number[] } = {
  icon: '/icons/icon-192.png',
  badge: '/icons/badge-72.png',
  vibrate: [200, 100, 200],
} as const;

/**
 * Records a notification dismissal event.
 * Stub — wire up to your analytics service as needed.
 */
export function handleNotificationClose(event: NotificationEvent): void {
  const tag = event.notification.tag ?? 'unknown';
  const timestamp = Date.now();

  // Analytics stub: replace with actual reporting call
  console.debug('[SW] notification closed', { tag, timestamp });

  // Example: fire-and-forget analytics beacon
  // event.waitUntil(
  //   fetch('/api/analytics/notification-close', {
  //     method: 'POST',
  //     body: JSON.stringify({ tag, timestamp }),
  //     headers: { 'Content-Type': 'application/json' },
  //   }).catch(() => {})
  // );
}
