// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794309833943';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-DAb3rqBx.js",
  "./assets/AiDemandForecastModal-Bf5YVkd7.js",
  "./assets/AppUpdateModal-CrzZY6H_.js",
  "./assets/CakeFlavorsModal-C7Us8PuN.js",
  "./assets/CakeLabelPrintModal-O8P8AiJv.js",
  "./assets/customerAiAssistantService-Dzk9fQSl.js",
  "./assets/CustomerDisplayView-DYDFzM98.js",
  "./assets/CustomerExpressOrderModal-DpDiiH9K.js",
  "./assets/CustomerOrderLinkModal-D3ps3Oh4.js",
  "./assets/CustomerOrderPortal-DCQR2IMK.js",
  "./assets/CustomerShowcase-BkRO01n6.js",
  "./assets/CustomOrderPipeline-nofTQWYi.js",
  "./assets/ExpenseManagement-Bi8Y-B4A.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-qH-B0DQ-.js",
  "./assets/index-COe86uV7.css",
  "./assets/index-gvdB6o1M.js",
  "./assets/InventoryManagement-Dy57VMiW.js",
  "./assets/KitchenDisplayModal-BB84U_AL.js",
  "./assets/LicenseExpiredModal-m3nlsulv.js",
  "./assets/LicenseRenewalModal-ORcVQKrw.js",
  "./assets/LoyaltyRewardsModal-XUPzAN21.js",
  "./assets/NewCustomOrderModal-CIxCtqne.js",
  "./assets/ReportsDashboard-Bgi5FxFm.js",
  "./assets/ReserveFundDashboard-zOf45msI.js",
  "./assets/ReserveFundModal-C8HvMjUj.js",
  "./assets/SalesHistory-CXCb49Ly.js",
  "./assets/SettingsModal-DBgjH7wt.js",
  "./assets/ShiftModal-BmDjl-9l.js",
  "./assets/SmartBirthdayCrmModal-BEqAXv9V.js",
  "./assets/StaffManagement-CygXfig7.js",
  "./assets/StoreAuthModal-BL4B0Cys.js",
  "./assets/SuperAdminPortalModal-BzWTbh6D.js",
  "./assets/ThemePickerModal-DRDF4et9.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-DFjRPULu.js",
  "./assets/vendor-react-D7VNmBfW.js",
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
