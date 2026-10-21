// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1792586792476';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-CTC6BBG_.js",
  "./assets/AiDemandForecastModal-jRBz6Qfr.js",
  "./assets/AppUpdateModal-BGzn--zo.js",
  "./assets/CakeFlavorsModal-Cl60FHS_.js",
  "./assets/customerAiAssistantService-CMZNH242.js",
  "./assets/CustomerOrderLinkModal-DmBwAZEO.js",
  "./assets/CustomerOrderPortal-BK77sPiJ.js",
  "./assets/CustomerShowcase-BpezI_tB.js",
  "./assets/CustomOrderPipeline-C-Ynh3tl.js",
  "./assets/ExpenseManagement-DBVrfXp5.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-2sMmyvFT.js",
  "./assets/index-Cu0-gUo_.js",
  "./assets/index-umkW-OeQ.css",
  "./assets/InventoryManagement-yaoNwAFf.js",
  "./assets/KhmerVoicePosModal-B7uuuRnu.js",
  "./assets/KitchenDisplayModal-MpLe1b7p.js",
  "./assets/LicenseExpiredModal-STWxHcWc.js",
  "./assets/LicenseRenewalModal-C7YYDZi9.js",
  "./assets/NewCustomOrderModal-DgqmBwyM.js",
  "./assets/ReportsDashboard-8W_XnMJF.js",
  "./assets/ReserveFundDashboard-B38yu03V.js",
  "./assets/ReserveFundModal-DgyDr5BQ.js",
  "./assets/SalesHistory-CQrU3HPn.js",
  "./assets/SettingsModal-DXWWzpJl.js",
  "./assets/ShiftModal-fVKImTHN.js",
  "./assets/SmartBirthdayCrmModal-CTMOLXLC.js",
  "./assets/StaffManagement-l_dalPkJ.js",
  "./assets/StoreAuthModal-3CM4pLsf.js",
  "./assets/StoreLocationModal-ZXn5Yooy.js",
  "./assets/SuperAdminPortalModal-RRy1zfOh.js",
  "./assets/ThemePickerModal-CNw0PAiT.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-C-3W88xw.js",
  "./assets/vendor-react-CgnxuV26.js",
  "./assets/vendor-utils-BXPL24B5.js"
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
