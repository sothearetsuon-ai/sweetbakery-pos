// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794390198512';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-VM2nVxop.js",
  "./assets/AiDemandForecastModal-DaIzln8K.js",
  "./assets/AppUpdateModal-BKbNWneT.js",
  "./assets/CakeFlavorsModal-DWLgTwr6.js",
  "./assets/CakeLabelPrintModal-DPA7mJTH.js",
  "./assets/customerAiAssistantService-BYY4FHbB.js",
  "./assets/CustomerExpressOrderModal-Dy25J7N7.js",
  "./assets/CustomerOrderLinkModal-C4BwRJMq.js",
  "./assets/CustomerOrderPortal-C9kJa6YF.js",
  "./assets/CustomerShowcase-DqCIA-DB.js",
  "./assets/CustomOrderPipeline-CjHI-nPS.js",
  "./assets/DigitalReceiptView-k6QYz0vM.js",
  "./assets/ExpenseManagement-DwTRtkNz.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-8byCQIZT.js",
  "./assets/index-BBoMkYSZ.js",
  "./assets/index-iG3dBtLh.css",
  "./assets/InventoryManagement--QzaYLgr.js",
  "./assets/KitchenDisplayModal-BCV_Wsrs.js",
  "./assets/LicenseExpiredModal-BCttZZuw.js",
  "./assets/LicenseRenewalModal-CHyxy9MC.js",
  "./assets/LoyaltyRewardsModal-9BpeLm4B.js",
  "./assets/NewCustomOrderModal-BsOODfUD.js",
  "./assets/ReportsDashboard-BXIjvGkL.js",
  "./assets/ReserveFundDashboard-CEtIE2H-.js",
  "./assets/ReserveFundModal-Br7VFUuE.js",
  "./assets/SalesHistory-Dub_HZKL.js",
  "./assets/SettingsModal-BotpRf9d.js",
  "./assets/ShiftModal-LrcC3WeD.js",
  "./assets/SmartBirthdayCrmModal-B5Jor07y.js",
  "./assets/StaffManagement-ydRMzWIT.js",
  "./assets/StoreAuthModal-Bc1ZJVB7.js",
  "./assets/SuperAdminPortalModal-C1bg-JhH.js",
  "./assets/ThemePickerModal-DGqUiEgR.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-Cww3kULT.js",
  "./assets/vendor-react-zNi47vQG.js",
  "./assets/vendor-utils-CFyYD28R.js"
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
