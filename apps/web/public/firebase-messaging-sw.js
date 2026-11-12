// 알림 data에서 redirectUrl 꺼내기
// - 직접 띄운 알림: data.redirectUrl
// - 서버가 notification 페이로드로 보내서 Firebase SDK가 자동으로 띄운 알림: data.FCM_MSG.data.redirectUrl
function getRedirectUrl(notificationData) {
  const direct = notificationData?.redirectUrl;
  if (typeof direct === 'string') return direct;

  const fromFcm = notificationData?.FCM_MSG?.data?.redirectUrl;
  if (typeof fromFcm === 'string') return fromFcm;

  return null;
}

// Firebase SDK의 클릭 처리보다 먼저 실행되도록 importScripts 위에 등록
self.addEventListener('notificationclick', (event) => {
  const redirectUrl = getRedirectUrl(event.notification.data);

  if (!redirectUrl) return;

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

      // 이미 열린 사이트 탭이 있으면 그 탭에서 이동, 없으면 새 창
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const existing = windowClients.find(
        (client) => new URL(client.url).origin === self.location.origin
      );

      if (existing) {
        try {
          await existing.focus();
          await existing.navigate(target.href);
          return;
        } catch {
          // 서비스 워커가 제어하지 않는 탭이면 navigate가 실패할 수 있음 → 새 창으로
        }
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

  // notification 페이로드가 있으면 Firebase SDK가 자동으로 알림을 띄움 (중복 방지)
  // 이때 클릭 시 redirectUrl은 data.FCM_MSG.data에 들어 있음 → getRedirectUrl에서 처리
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
