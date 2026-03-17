/// <reference lib="webworker" />

import { DEFAULT_NOTIFICATION_OPTIONS } from './sw-notifications';

declare const self: ServiceWorkerGlobalScope;

// Extended notification types not in the standard DOM lib
interface ExtendedNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  image?: string;
  actions?: ExtendedNotificationAction[];
  vibrate?: number[];
}

// NotificationClickEvent is a SW-specific type absent from lib.dom.d.ts
interface NotificationClickEvent extends ExtendableEvent {
  action: string;
  notification: Notification;
}

interface PushPayload {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  actions?: ExtendedNotificationAction[];
  data?: Record<string, unknown>;
}

/**
 * Handles incoming push messages and shows a notification.
 */
export function handlePushEvent(event: PushEvent): void {
  let payload: PushPayload = { title: 'RFE Foam Pro', body: '' };

  if (event.data) {
    try {
      payload = event.data.json() as PushPayload;
    } catch {
      payload.body = event.data.text();
    }
  }

  const options: ExtendedNotificationOptions = {
    ...DEFAULT_NOTIFICATION_OPTIONS,
    body: payload.body ?? '',
    icon: payload.icon ?? DEFAULT_NOTIFICATION_OPTIONS.icon,
    badge: payload.badge ?? DEFAULT_NOTIFICATION_OPTIONS.badge,
    image: payload.image,
    tag: payload.tag,
    actions: payload.actions,
    data: { url: payload.url ?? '/', ...payload.data },
  };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'RFE Foam Pro', options as NotificationOptions)
  );
}

/**
 * Handles a tap on a displayed notification — focuses an existing window
 * or opens a new one at the target URL.
 */
export function handleNotificationClick(event: NotificationClickEvent): void {
  event.notification.close();
  const targetUrl: string = (event.notification.data as { url?: string })?.url ?? '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === targetUrl && 'focus' in client) {
            return (client as WindowClient).focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      })
  );
}
