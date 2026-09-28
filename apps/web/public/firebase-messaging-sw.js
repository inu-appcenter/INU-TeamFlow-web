self.addEventListener('notificationclick', (event) => {
  const redirectUrl = event.notification.data?.redirectUrl;

  if (typeof redirectUrl !== 'string') return;

  event.stopImmediatePropagation();
  event.notification.close();

  event.waitUntil(
    (async () => {
      let target;

      try {
        target = new URL(redirectUrl, self.location.origin);
      } catch {
        target = new URL('/notification', self.location.origin);
      }

      // 알림 데이터로 다른 사이트를 열지 않도록 제한한다.
      if (target.origin !== self.location.origin) {
        target = new URL('/notification', self.location.origin);
      }

      await self.clients.openWindow(target.href);
    })()
  );
});

importScripts(
  'https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.info('[FCM SW]', {
    messageId: payload.messageId,
    hasNotification: Boolean(payload.notification),
  });

  if (payload.notification) return;

  return self.registration.showNotification(
    payload.data?.title ?? 'TEAM FLOW',
    {
      body: payload.data?.body ?? '',
      data: {
        redirectUrl: payload.data?.redirectUrl ?? '/notification',
      },
    }
  );
});
