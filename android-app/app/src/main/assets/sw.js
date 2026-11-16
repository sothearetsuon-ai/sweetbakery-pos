// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794821743427';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-CPxUajgE.js",
  "./assets/AiDemandForecastModal-KGEf0ng_.js",
  "./assets/AppUpdateModal-DXaeqnIy.js",
  "./assets/BatchCatalogUploadModal-C_7dExtu.js",
  "./assets/CakeFlavorsModal-CvH9Fc45.js",
  "./assets/CakeLabelPrintModal-CDFiQ6SR.js",
  "./assets/customerAiAssistantService-0R2h5saS.js",
  "./assets/CustomerExpressOrderModal-D3ERjdc7.js",
  "./assets/CustomerOrderLinkModal-B_7ski6A.js",
  "./assets/CustomerOrderPortal-M3SGlIqR.js",
  "./assets/CustomerShowcase-CrB_uAUU.js",
  "./assets/CustomOrderPipeline-CgG_Wcdr.js",
  "./assets/DigitalReceiptView-BcH39Y8P.js",
  "./assets/ExpenseManagement-BQktZC4i.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-DuoB1WW1.js",
  "./assets/index-BbcrnQJv.js",
  "./assets/index-Dngp2YDi.css",
  "./assets/InventoryManagement-CThFEoOx.js",
  "./assets/KitchenDisplayModal-G-EbRRl1.js",
  "./assets/LicenseExpiredModal-tT0wEk3Q.js",
  "./assets/LicenseRenewalModal-Z99H0KAY.js",
  "./assets/LoyaltyRewardsModal-B8sV7Cpg.js",
  "./assets/NewCustomOrderModal-aneE2Ydz.js",
  "./assets/ReportsDashboard-u67q3Dcw.js",
  "./assets/ReserveFundDashboard-ClwvQxB9.js",
  "./assets/ReserveFundModal-3yok6ONd.js",
  "./assets/SalesHistory-DvqTwI-D.js",
  "./assets/SettingsModal-C_3wPMc8.js",
  "./assets/ShiftModal-B9vHNOdI.js",
  "./assets/SmartBirthdayCrmModal-DvrdTke-.js",
  "./assets/StaffManagement-DixrFVA2.js",
  "./assets/StoreAuthModal-DIyiYTbt.js",
  "./assets/SuperAdminPortalModal-BhQ4PyfX.js",
  "./assets/ThemePickerModal-BxN1MHa2.js",
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
