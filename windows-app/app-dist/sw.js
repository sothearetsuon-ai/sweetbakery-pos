// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794819913228';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-DKMcWeXK.js",
  "./assets/AiDemandForecastModal-rN4ShdvZ.js",
  "./assets/AppUpdateModal-Cv93CQLY.js",
  "./assets/BatchCatalogUploadModal-D_p0ovDi.js",
  "./assets/CakeFlavorsModal-Qblrr7pn.js",
  "./assets/CakeLabelPrintModal-CrNIfx59.js",
  "./assets/customerAiAssistantService-D9zHe1uQ.js",
  "./assets/CustomerExpressOrderModal-CzwSWXON.js",
  "./assets/CustomerOrderLinkModal-CyQxTzJk.js",
  "./assets/CustomerOrderPortal-K5t4gz2Y.js",
  "./assets/CustomerShowcase-Ch_-CL1R.js",
  "./assets/CustomOrderPipeline-DHUS7hEB.js",
  "./assets/DigitalReceiptView-2zh8Av27.js",
  "./assets/ExpenseManagement-1Pcm8gMc.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-CVmiRlh3.js",
  "./assets/index-CFoXhedM.js",
  "./assets/index-CmBvv9B_.css",
  "./assets/InventoryManagement-Ek66FvHi.js",
  "./assets/KitchenDisplayModal-Be0Dmb6b.js",
  "./assets/LicenseExpiredModal-BqiEL468.js",
  "./assets/LicenseRenewalModal-CGZHjCkl.js",
  "./assets/LoyaltyRewardsModal-D7vTAHUo.js",
  "./assets/NewCustomOrderModal-CyQVXrLQ.js",
  "./assets/ReportsDashboard-CXR-WBjK.js",
  "./assets/ReserveFundDashboard-BiMD6tju.js",
  "./assets/ReserveFundModal-70OARHjU.js",
  "./assets/SalesHistory-B0Oa5uSO.js",
  "./assets/SettingsModal-DLz-XTGJ.js",
  "./assets/ShiftModal-DCLcTq8P.js",
  "./assets/SmartBirthdayCrmModal-sEYyP6vB.js",
  "./assets/StaffManagement-Bww0bvVt.js",
  "./assets/StoreAuthModal-DEc7PFVk.js",
  "./assets/SuperAdminPortalModal-CaJFNwiM.js",
  "./assets/ThemePickerModal-DNf6X6Iv.js",
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
