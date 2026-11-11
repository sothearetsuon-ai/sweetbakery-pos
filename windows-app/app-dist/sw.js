// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794403339371';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-Bg4rQlAL.js",
  "./assets/AiDemandForecastModal-CkSy_f6D.js",
  "./assets/AppUpdateModal-2Orhnyzz.js",
  "./assets/CakeFlavorsModal-CQNyvPWF.js",
  "./assets/CakeLabelPrintModal-aWzJv77R.js",
  "./assets/customerAiAssistantService-CWAketNz.js",
  "./assets/CustomerExpressOrderModal-g0EW9UG9.js",
  "./assets/CustomerOrderLinkModal-CbM7G1MD.js",
  "./assets/CustomerOrderPortal-Dm1pY3im.js",
  "./assets/CustomerShowcase-cAM43Jcw.js",
  "./assets/CustomOrderPipeline-nVs-7ajd.js",
  "./assets/DigitalReceiptView-Bw7uq2JD.js",
  "./assets/ExpenseManagement-DvOru-v5.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-D4ral5-5.js",
  "./assets/index-8jDYZV6q.js",
  "./assets/index-DvyARDj9.css",
  "./assets/InventoryManagement-UorhDpdc.js",
  "./assets/KitchenDisplayModal-BznpRM-T.js",
  "./assets/LicenseExpiredModal-iXy_6O50.js",
  "./assets/LicenseRenewalModal-DFP1MjOj.js",
  "./assets/LoyaltyRewardsModal-BYbfWIza.js",
  "./assets/NewCustomOrderModal-a5SAZFyA.js",
  "./assets/ReportsDashboard-1_jexOhB.js",
  "./assets/ReserveFundDashboard-BT447856.js",
  "./assets/ReserveFundModal-B7tRCS_T.js",
  "./assets/SalesHistory-CYs8vtme.js",
  "./assets/SettingsModal-qP1xBi9T.js",
  "./assets/ShiftModal-BFv0JV92.js",
  "./assets/SmartBirthdayCrmModal-CIh5Zhle.js",
  "./assets/StaffManagement-BgzsvxIr.js",
  "./assets/StoreAuthModal-DGNu0ry_.js",
  "./assets/SuperAdminPortalModal-T3q0LC6F.js",
  "./assets/ThemePickerModal-C3dmmbQD.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-B88VL7z5.js",
  "./assets/vendor-react-rZG2QXDK.js",
  "./assets/vendor-utils-Dh-0Pp5R.js"
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
