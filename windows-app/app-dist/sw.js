// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794564087171';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-DhOX5ozd.js",
  "./assets/AiDemandForecastModal-CcBzK9cb.js",
  "./assets/AppUpdateModal-DIXxqTg8.js",
  "./assets/BatchCatalogUploadModal-Ccru5se3.js",
  "./assets/CakeFlavorsModal-lKzBQqwj.js",
  "./assets/CakeLabelPrintModal-D1rrmHsw.js",
  "./assets/customerAiAssistantService-Cg6M4_PD.js",
  "./assets/CustomerExpressOrderModal-XuqrY-pZ.js",
  "./assets/CustomerOrderLinkModal-BTBtRCXI.js",
  "./assets/CustomerOrderPortal-ClOU2kYB.js",
  "./assets/CustomerShowcase-D4yFY1D9.js",
  "./assets/CustomOrderPipeline-ChYkK3ig.js",
  "./assets/DigitalReceiptView-Dh6b64iS.js",
  "./assets/ExpenseManagement-GGD400kV.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-CtzRtWRB.js",
  "./assets/index-BuymJmyL.js",
  "./assets/index-DFoTfpZT.css",
  "./assets/InventoryManagement-Cr-Lpt6k.js",
  "./assets/KitchenDisplayModal-DcpLbJnD.js",
  "./assets/LicenseExpiredModal-77fm5FpU.js",
  "./assets/LicenseRenewalModal-73HsNDUT.js",
  "./assets/LoyaltyRewardsModal-BX81Jsdd.js",
  "./assets/NewCustomOrderModal-oRY0ugLZ.js",
  "./assets/ReportsDashboard-BBR7qMWf.js",
  "./assets/ReserveFundDashboard-BV7AIejv.js",
  "./assets/ReserveFundModal-Sd0XAQ3w.js",
  "./assets/SalesHistory-BEm_WRIA.js",
  "./assets/SettingsModal-CHu4F_3Z.js",
  "./assets/ShiftModal-CKp5c3EW.js",
  "./assets/SmartBirthdayCrmModal-BEAv2C7G.js",
  "./assets/StaffManagement-DxSXD5c2.js",
  "./assets/StoreAuthModal-D2DoLa8X.js",
  "./assets/SuperAdminPortalModal-Wc4Xd6VA.js",
  "./assets/ThemePickerModal-CSkNTR0L.js",
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
