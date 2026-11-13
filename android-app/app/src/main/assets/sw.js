// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794576778823';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-DGrp-1i8.js",
  "./assets/AiDemandForecastModal-Boa89JWd.js",
  "./assets/AppUpdateModal-Dg5JmCAv.js",
  "./assets/BatchCatalogUploadModal-DCpbxqWs.js",
  "./assets/CakeFlavorsModal-DGw9c8rW.js",
  "./assets/CakeLabelPrintModal-CoEzay6t.js",
  "./assets/customerAiAssistantService-BzQIOm0H.js",
  "./assets/CustomerExpressOrderModal-DlBXdA5n.js",
  "./assets/CustomerOrderLinkModal-BJv2MjU8.js",
  "./assets/CustomerOrderPortal-DXHHxW8m.js",
  "./assets/CustomerShowcase-BZ8Ih6gK.js",
  "./assets/CustomOrderPipeline-CzIEACxS.js",
  "./assets/DigitalReceiptView-oq55PQiH.js",
  "./assets/ExpenseManagement-BrJSPAiK.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-CCBXxtve.js",
  "./assets/index-C17SQG6l.js",
  "./assets/index-DFoTfpZT.css",
  "./assets/InventoryManagement-B_LpzTKU.js",
  "./assets/KitchenDisplayModal-Cuby32Da.js",
  "./assets/LicenseExpiredModal-CmlQbHNi.js",
  "./assets/LicenseRenewalModal-DR5ZVKU6.js",
  "./assets/LoyaltyRewardsModal-BMeX_NVQ.js",
  "./assets/NewCustomOrderModal-8ysQMvmW.js",
  "./assets/ReportsDashboard-CSt9tB0D.js",
  "./assets/ReserveFundDashboard-9UhgFtkK.js",
  "./assets/ReserveFundModal-Cr_zU9r3.js",
  "./assets/SalesHistory-7ZO0sJwa.js",
  "./assets/SettingsModal-Dctv74UG.js",
  "./assets/ShiftModal-DNkDBuAc.js",
  "./assets/SmartBirthdayCrmModal-C6bzB-mF.js",
  "./assets/StaffManagement-B17gZq1q.js",
  "./assets/StoreAuthModal-RG8hJzIf.js",
  "./assets/SuperAdminPortalModal-CPVAan4z.js",
  "./assets/ThemePickerModal-Cv4nSc-D.js",
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
