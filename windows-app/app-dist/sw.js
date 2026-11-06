// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1793929339891';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-CxVhTD2P.js",
  "./assets/AiDemandForecastModal-C5rMiqNA.js",
  "./assets/AppUpdateModal-DidYQimE.js",
  "./assets/CakeFlavorsModal-DxORYPIZ.js",
  "./assets/customerAiAssistantService-BpENmjrV.js",
  "./assets/CustomerDisplayView-5doArLwc.js",
  "./assets/CustomerOrderLinkModal-5D-yUd3g.js",
  "./assets/CustomerOrderPortal-DeQeHmCZ.js",
  "./assets/CustomerShowcase-CsXDQ6c6.js",
  "./assets/CustomOrderPipeline-ChsMkRoO.js",
  "./assets/ExpenseManagement-BtObY92G.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-oo9hRrDZ.js",
  "./assets/index-BHQZEYlP.css",
  "./assets/index-zekrgmFK.js",
  "./assets/InventoryManagement-7oSCz8tt.js",
  "./assets/KitchenDisplayModal-O7m5cVDg.js",
  "./assets/LicenseExpiredModal-CDJ5J1QQ.js",
  "./assets/LicenseRenewalModal-CRr7G4T5.js",
  "./assets/NewCustomOrderModal-iFoHQBzR.js",
  "./assets/ReportsDashboard-C3VHz6Mw.js",
  "./assets/ReserveFundDashboard-DNvx90Mf.js",
  "./assets/ReserveFundModal-ho1c3Y2-.js",
  "./assets/SalesHistory-WicIuhyc.js",
  "./assets/SettingsModal-9G1cjApx.js",
  "./assets/ShiftModal-sdnS0vCQ.js",
  "./assets/SmartBirthdayCrmModal-WWnfVXbT.js",
  "./assets/StaffManagement-C3LQBQZ0.js",
  "./assets/StoreAuthModal-B99gNzdL.js",
  "./assets/StoreLocationModal-n-BoHyV6.js",
  "./assets/SuperAdminPortalModal-CYn0pZ7g.js",
  "./assets/ThemePickerModal-D2PpHM24.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-DFjRPULu.js",
  "./assets/vendor-react-T-2thzxF.js",
  "./assets/vendor-utils-g8O2Mb-j.js"
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching App Shell & Assets for 100% Offline Mode...');
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation requests (Page reload / URL open) -> Fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedPage =
            (await cache.match(event.request)) ||
            (await cache.match('./index.html')) ||
            (await cache.match('/index.html')) ||
            (await cache.match('./')) ||
            (await cache.match('/'));
          if (cachedPage) return cachedPage;
          const keys = await cache.keys();
          for (const key of keys) {
            if (key.url.endsWith('index.html') || key.url.endsWith('/')) {
              const matched = await cache.match(key);
              if (matched) return matched;
            }
          }
          return new Response(
            '<!DOCTYPE html><html lang="km"><head><meta charset="utf-8"><title>SweetBakery POS</title></head><body style="font-family:sans-serif;text-align:center;padding:60px;background:#fff1f2;color:#be185d;"><h2>🎂 កំពុងភ្ជាប់ទៅកាន់ SweetBakery POS...</h2><p style="color:#64748b;">សូមរង់ចាំបន្តិច ឬចុចប៊ូតុងខាងក្រោមដើម្បីដំណើរការឡើងវិញ។</p><button onclick="window.location.reload()" style="padding:12px 28px;border-radius:12px;background:#ec4899;color:white;border:none;cursor:pointer;font-size:16px;box-shadow:0 4px 12px rgba(236,72,153,0.3);">🔄 ផ្ទុកទំព័រឡើងវិញ (Reload)</button></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // 2. Same-origin assets (.js, .css, images, fonts) -> Cache-First for instant offline speed
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return response;
          })
          .catch(() => {
            return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
          });
      })
    );
    return;
  }

  // 3. Third-party CDN assets (Google Fonts, etc.) -> Cache first, network fallback
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return response;
          })
          .catch(() => cached || new Response('', { status: 408 }));
      })
    );
    return;
  }
});
