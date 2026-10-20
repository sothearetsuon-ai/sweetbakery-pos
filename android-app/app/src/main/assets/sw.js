// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1792505201996';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-5cbo2v-C.js",
  "./assets/AiDemandForecastModal-R4ItjpXd.js",
  "./assets/AppUpdateModal-BksEnY88.js",
  "./assets/CakeFlavorsModal-CgahX969.js",
  "./assets/customerAiAssistantService-BRvgVB__.js",
  "./assets/CustomerOrderLinkModal-BQmiYimT.js",
  "./assets/CustomerOrderPortal-DrT6Y6dA.js",
  "./assets/CustomerShowcase-cIsW0b8u.js",
  "./assets/CustomOrderPipeline-t9cRie_y.js",
  "./assets/ExpenseManagement-B0KTWoJV.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/FloatingMiniVideoPlayer-BgG4xJLU.js",
  "./assets/InAppChatModal-Ctmeeg8b.js",
  "./assets/index-DGqjoljy.js",
  "./assets/index-DQn7mvi0.css",
  "./assets/InventoryManagement-CrkjFMzr.js",
  "./assets/KhmerVoicePosModal-D2YsrCsO.js",
  "./assets/KitchenDisplayModal-9PgUpohg.js",
  "./assets/LicenseExpiredModal-BjVHcF5p.js",
  "./assets/LicenseRenewalModal-DQtwA8Ar.js",
  "./assets/MusicPlayerModal-mSMtorQ0.js",
  "./assets/NewCustomOrderModal-BdHNDEQN.js",
  "./assets/ReportsDashboard-jcAX-KfP.js",
  "./assets/ReserveFundDashboard-C5cVA6br.js",
  "./assets/ReserveFundModal-B3o4jT2l.js",
  "./assets/SalesHistory-D8RQOv1n.js",
  "./assets/SettingsModal-0sEN0rT3.js",
  "./assets/ShiftModal-C_2rwBwb.js",
  "./assets/SmartBirthdayCrmModal-Dz_6we72.js",
  "./assets/StaffManagement-B2zmBfFt.js",
  "./assets/StoreAuthModal-ZvhCrPQf.js",
  "./assets/StoreLocationModal-DEaCwvnw.js",
  "./assets/SuperAdminPortalModal-Bv2dVnaj.js",
  "./assets/ThemePickerModal-DtVQV5Md.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-mpEdFxQ8.js",
  "./assets/vendor-react-BWFJC2f8.js",
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
