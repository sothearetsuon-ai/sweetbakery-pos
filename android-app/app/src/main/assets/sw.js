// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794303741001';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-CRbUNUHy.js",
  "./assets/AiDemandForecastModal-BR3iIMa7.js",
  "./assets/AppUpdateModal-Be_qp43h.js",
  "./assets/CakeFlavorsModal-BdIjtDkh.js",
  "./assets/CakeLabelPrintModal-C0TwSWFb.js",
  "./assets/customerAiAssistantService-CqkYjN44.js",
  "./assets/CustomerDisplayView-2Q7fdLXa.js",
  "./assets/CustomerExpressOrderModal-Ymi517sI.js",
  "./assets/CustomerOrderLinkModal-Bcfdv4aS.js",
  "./assets/CustomerOrderPortal-OPXm3h0U.js",
  "./assets/CustomerShowcase-Cw7umr0g.js",
  "./assets/CustomOrderPipeline-CNiwsTAa.js",
  "./assets/ExpenseManagement-zh4iWc1Z.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-wOEIWXsA.js",
  "./assets/index-7GUFwBPx.js",
  "./assets/index-B9s_sLu7.css",
  "./assets/InventoryManagement-AU_dTjG6.js",
  "./assets/KitchenDisplayModal-BLH388Yp.js",
  "./assets/LicenseExpiredModal-DL5-wBcm.js",
  "./assets/LicenseRenewalModal-BD5_co0d.js",
  "./assets/LoyaltyRewardsModal-CBxP8iYq.js",
  "./assets/NewCustomOrderModal-C6y5kHi4.js",
  "./assets/ReportsDashboard-C70R-YXA.js",
  "./assets/ReserveFundDashboard-nvY8TGlS.js",
  "./assets/ReserveFundModal-C-0mUhTB.js",
  "./assets/SalesHistory-AJNCSdoR.js",
  "./assets/SettingsModal-0xQSK1og.js",
  "./assets/ShiftModal-CgE0NbuP.js",
  "./assets/SmartBirthdayCrmModal-Dd6O0anC.js",
  "./assets/StaffManagement-8WTT1c2-.js",
  "./assets/StoreAuthModal-CSPTGXZC.js",
  "./assets/SuperAdminPortalModal-BUXyghAa.js",
  "./assets/ThemePickerModal-C4emtldR.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-DFjRPULu.js",
  "./assets/vendor-react-DMn334vv.js",
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
