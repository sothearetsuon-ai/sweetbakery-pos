// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794202492818';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-CpsVkTzm.js",
  "./assets/AiDemandForecastModal-BWMkYEIn.js",
  "./assets/AppUpdateModal-1fvlsB_Q.js",
  "./assets/CakeFlavorsModal-OVHYvxut.js",
  "./assets/customerAiAssistantService-B303D9pj.js",
  "./assets/CustomerDisplayView-6OnQeIwP.js",
  "./assets/CustomerOrderLinkModal-0AkWH1Ay.js",
  "./assets/CustomerOrderPortal-D1zyMEaG.js",
  "./assets/CustomerShowcase-CR4hNokc.js",
  "./assets/CustomOrderPipeline-ChlBifGW.js",
  "./assets/ExpenseManagement-BmgocLZJ.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-C44KfOlP.js",
  "./assets/index-BqtmQJ8z.css",
  "./assets/index-D05BzNQ1.js",
  "./assets/InventoryManagement-Hh8P5eMo.js",
  "./assets/KitchenDisplayModal-Dxu-SogY.js",
  "./assets/LicenseExpiredModal-CruqYubh.js",
  "./assets/LicenseRenewalModal-B3v7LyoU.js",
  "./assets/NewCustomOrderModal-BDQpSkeb.js",
  "./assets/ReportsDashboard-C5Il1OAM.js",
  "./assets/ReserveFundDashboard-b15cUkwQ.js",
  "./assets/ReserveFundModal-4y6IXFaK.js",
  "./assets/SalesHistory-B2X4-u5r.js",
  "./assets/SettingsModal-C01nP3XK.js",
  "./assets/ShiftModal-DazD_XU6.js",
  "./assets/SmartBirthdayCrmModal-1ITDYbhM.js",
  "./assets/StaffManagement-DTx_kybG.js",
  "./assets/StoreAuthModal-DlZdZGxy.js",
  "./assets/StoreLocationModal-CHCyv2z8.js",
  "./assets/SuperAdminPortalModal-JpXU5ELv.js",
  "./assets/ThemePickerModal-BwxIvWg1.js",
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
