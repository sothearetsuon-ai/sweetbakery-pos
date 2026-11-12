// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794496702464';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-Q0aRBxG9.js",
  "./assets/AiDemandForecastModal-CwaemDHM.js",
  "./assets/AppUpdateModal-BAbR6lIC.js",
  "./assets/BatchCatalogUploadModal-C7TiyCVI.js",
  "./assets/CakeFlavorsModal-Cv0K9Z14.js",
  "./assets/CakeLabelPrintModal-BSmx0gV0.js",
  "./assets/customerAiAssistantService-RraZT-G2.js",
  "./assets/CustomerExpressOrderModal-4CIg5Qw6.js",
  "./assets/CustomerOrderLinkModal-DnY2f4-q.js",
  "./assets/CustomerOrderPortal-BvAPYr9V.js",
  "./assets/CustomerShowcase-BRh-Lixq.js",
  "./assets/CustomOrderPipeline-Bgx1Vod0.js",
  "./assets/DigitalReceiptView-CkXAAcuN.js",
  "./assets/ExpenseManagement-TWFCLfPF.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-WaQReOMT.js",
  "./assets/index-BdaHq6Eh.js",
  "./assets/index-DFoTfpZT.css",
  "./assets/InventoryManagement-BvGZKORA.js",
  "./assets/KitchenDisplayModal-Cw6qF9qq.js",
  "./assets/LicenseExpiredModal-DKFECajX.js",
  "./assets/LicenseRenewalModal-De3f93f8.js",
  "./assets/LoyaltyRewardsModal-B_fbNQJI.js",
  "./assets/NewCustomOrderModal-0DDHSzbw.js",
  "./assets/ReportsDashboard-Ca38u7K2.js",
  "./assets/ReserveFundDashboard-Chc_-_wC.js",
  "./assets/ReserveFundModal-gxustAdG.js",
  "./assets/SalesHistory-BcoX-x-3.js",
  "./assets/SettingsModal-DX4kMM3X.js",
  "./assets/ShiftModal-C9oRq1CG.js",
  "./assets/SmartBirthdayCrmModal-BQHFr4gA.js",
  "./assets/StaffManagement-B_rn4TNA.js",
  "./assets/StoreAuthModal-CeJJHNSW.js",
  "./assets/SuperAdminPortalModal-BB_Cmr0m.js",
  "./assets/ThemePickerModal-NqwB2a3E.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-D31X9gUt.js",
  "./assets/vendor-react-CY96Sq2E.js",
  "./assets/vendor-utils-Dp_7fGEe.js"
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
