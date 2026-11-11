// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794392146281';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-CxvSBO0k.js",
  "./assets/AiDemandForecastModal-DYL6tr6l.js",
  "./assets/AppUpdateModal-CeuI5QFh.js",
  "./assets/CakeFlavorsModal-KC07Wxij.js",
  "./assets/CakeLabelPrintModal-CZtYtSqM.js",
  "./assets/customerAiAssistantService-GG0fWoSo.js",
  "./assets/CustomerExpressOrderModal-7Ax2-YAw.js",
  "./assets/CustomerOrderLinkModal-BkoyZ0PK.js",
  "./assets/CustomerOrderPortal-uApPLQbZ.js",
  "./assets/CustomerShowcase-DI7QDbA9.js",
  "./assets/CustomOrderPipeline-DVM0pQwE.js",
  "./assets/DigitalReceiptView-DK8XZWYL.js",
  "./assets/ExpenseManagement-CGaGBacY.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-Bqv_ZtJ8.js",
  "./assets/index-6afytMMB.js",
  "./assets/index-CrdRb7CT.css",
  "./assets/InventoryManagement-BMAMwU3h.js",
  "./assets/KitchenDisplayModal-Bdw8zvhs.js",
  "./assets/LicenseExpiredModal-CQp4CxFp.js",
  "./assets/LicenseRenewalModal-BG2h8_WV.js",
  "./assets/LoyaltyRewardsModal-BSy1DhVR.js",
  "./assets/NewCustomOrderModal-Cx1At8S8.js",
  "./assets/ReportsDashboard-LtHrSGGr.js",
  "./assets/ReserveFundDashboard-BJxTpiev.js",
  "./assets/ReserveFundModal-3bxplfjA.js",
  "./assets/SalesHistory-Dnui0xDo.js",
  "./assets/SettingsModal-dmJDFOai.js",
  "./assets/ShiftModal-B5Q0I4-L.js",
  "./assets/SmartBirthdayCrmModal-95uPsMq1.js",
  "./assets/StaffManagement-CHFW1Ypb.js",
  "./assets/StoreAuthModal-BtGrQ0H-.js",
  "./assets/SuperAdminPortalModal-Dnoer3wy.js",
  "./assets/ThemePickerModal-CuyHhLCI.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-CiA9TBHz.js",
  "./assets/vendor-react-3dxeqgE9.js",
  "./assets/vendor-utils-2goAXMjP.js"
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
