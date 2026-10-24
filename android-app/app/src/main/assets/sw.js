// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1792807606726';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-C6MUN7wu.js",
  "./assets/AiDemandForecastModal-fjLDMyQ4.js",
  "./assets/AppUpdateModal-BYMbiaaX.js",
  "./assets/CakeFlavorsModal-Ixl2v9yc.js",
  "./assets/customerAiAssistantService-BfEfMag3.js",
  "./assets/CustomerDisplayView-B5nV2irv.js",
  "./assets/CustomerOrderLinkModal-BzzkhFWy.js",
  "./assets/CustomerOrderPortal-DiHau2C9.js",
  "./assets/CustomerShowcase-Cnf5rNSY.js",
  "./assets/CustomOrderPipeline-C_0mO8tC.js",
  "./assets/ExpenseManagement-CcsmD2K0.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-CnJM4yff.js",
  "./assets/index-21mHH-6b.css",
  "./assets/index-c0vcNj20.js",
  "./assets/InventoryManagement-CyleB0B0.js",
  "./assets/KitchenDisplayModal-Cbi6QVIq.js",
  "./assets/LicenseExpiredModal-CdcSl22_.js",
  "./assets/LicenseRenewalModal-BtzSKvjE.js",
  "./assets/NewCustomOrderModal-bT1h-w8M.js",
  "./assets/ReportsDashboard-DiWIhDWp.js",
  "./assets/ReserveFundDashboard-TP3u6oyc.js",
  "./assets/ReserveFundModal-DtQfSFkz.js",
  "./assets/SalesHistory-X-mt270d.js",
  "./assets/SettingsModal-DU1w30Mv.js",
  "./assets/ShiftModal-yl-Nn4un.js",
  "./assets/SmartBirthdayCrmModal-DSyUyTbO.js",
  "./assets/StaffManagement-Do3T2kJh.js",
  "./assets/StoreAuthModal-DTffP9S5.js",
  "./assets/StoreLocationModal-Dw54gHNf.js",
  "./assets/SuperAdminPortalModal-Bf9iIfxC.js",
  "./assets/ThemePickerModal-CVE6nYr2.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-cwAdVUfo.js",
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
