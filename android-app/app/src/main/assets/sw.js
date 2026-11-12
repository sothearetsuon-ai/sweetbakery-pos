// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794448226972';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-BeRl7oXY.js",
  "./assets/AiDemandForecastModal-C1JY2tLM.js",
  "./assets/AppUpdateModal-DVng8MQ0.js",
  "./assets/CakeFlavorsModal-KPUWHwMs.js",
  "./assets/CakeLabelPrintModal-D_7IWzZj.js",
  "./assets/customerAiAssistantService-kqprJ6-g.js",
  "./assets/CustomerExpressOrderModal-MVp5Mj6v.js",
  "./assets/CustomerOrderLinkModal-BmcrwXN3.js",
  "./assets/CustomerOrderPortal-Bi1_nJXA.js",
  "./assets/CustomerShowcase-DUoNqiml.js",
  "./assets/CustomOrderPipeline-lX7N_IkG.js",
  "./assets/DigitalReceiptView-CQx9eFDE.js",
  "./assets/ExpenseManagement-3jwTb3UL.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-4o-Ovl5K.js",
  "./assets/index-CNDkGypy.js",
  "./assets/index-DJEUBZqW.css",
  "./assets/InventoryManagement-CgSeYJDM.js",
  "./assets/KitchenDisplayModal-BQaImtdX.js",
  "./assets/LicenseExpiredModal-DsCNXPUU.js",
  "./assets/LicenseRenewalModal-Su6llNzj.js",
  "./assets/LoyaltyRewardsModal-Bqkt7BCz.js",
  "./assets/NewCustomOrderModal-k0S6UBDp.js",
  "./assets/ReportsDashboard-Db7Y_Ks1.js",
  "./assets/ReserveFundDashboard-C0xNO-zQ.js",
  "./assets/ReserveFundModal-BXOsgp1l.js",
  "./assets/SalesHistory-B0FPKOpP.js",
  "./assets/SettingsModal-DTs8yRNN.js",
  "./assets/ShiftModal-D7VfNpQm.js",
  "./assets/SmartBirthdayCrmModal-BZRqHz-S.js",
  "./assets/StaffManagement-DKv712rk.js",
  "./assets/StoreAuthModal-BpLzxOX_.js",
  "./assets/SuperAdminPortalModal-BeY3oNDD.js",
  "./assets/ThemePickerModal-CKCPS-xG.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-BvderCBI.js",
  "./assets/vendor-react-rZG2QXDK.js",
  "./assets/vendor-utils-DaAZcVBy.js"
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
