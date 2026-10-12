const CACHE = 'pitch-v5';
const CORE = ['./', './index.html'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 새 버전 알림의 새로고침: 대기 중인 서비스 워커를 바로 활성화
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 아이콘과 manifest는 서비스 워커를 거치지 않고 브라우저가 직접 받게 한다(홈 화면 아이콘 로딩에 간섭하지 않도록)
  const u = new URL(e.request.url);
  if (u.origin === location.origin && (/\.(png|svg|ico|webmanifest)$/.test(u.pathname) || u.pathname === '/version.json')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
