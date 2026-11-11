// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794395546284';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-w_U2o242.js",
  "./assets/AiDemandForecastModal-Dw3Fe9rZ.js",
  "./assets/AppUpdateModal-qqIquuFA.js",
  "./assets/CakeFlavorsModal-D728BVep.js",
  "./assets/CakeLabelPrintModal-DDu-cIbF.js",
  "./assets/customerAiAssistantService-CVgF0XuY.js",
  "./assets/CustomerExpressOrderModal-Cwy5g29b.js",
  "./assets/CustomerOrderLinkModal-C8c9TRWY.js",
  "./assets/CustomerOrderPortal-RNyrpxuY.js",
  "./assets/CustomerShowcase-DjdELpge.js",
  "./assets/CustomOrderPipeline-rmjAHiAf.js",
  "./assets/DigitalReceiptView-DwNIPHD_.js",
  "./assets/ExpenseManagement-DEzf8bSr.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-znJdtqKO.js",
  "./assets/index-DaJLsuYH.js",
  "./assets/index-DvyARDj9.css",
  "./assets/InventoryManagement-qWEvc98l.js",
  "./assets/KitchenDisplayModal-nwahZ2yO.js",
  "./assets/LicenseExpiredModal-DPNv4VdZ.js",
  "./assets/LicenseRenewalModal-BuqZM09Q.js",
  "./assets/LoyaltyRewardsModal-BR2Ca95G.js",
  "./assets/NewCustomOrderModal-C0ufDgGf.js",
  "./assets/ReportsDashboard-BZsKS4vr.js",
  "./assets/ReserveFundDashboard-6ajv0Zgf.js",
  "./assets/ReserveFundModal-BhZ0Cfyq.js",
  "./assets/SalesHistory-CNpIC_wL.js",
  "./assets/SettingsModal-Dr-TaNOD.js",
  "./assets/ShiftModal-CdVgVN-c.js",
  "./assets/SmartBirthdayCrmModal-D9iMiHvb.js",
  "./assets/StaffManagement-CGRa3ZU8.js",
  "./assets/StoreAuthModal-5zIiKoB3.js",
  "./assets/SuperAdminPortalModal-Baazvnba.js",
  "./assets/ThemePickerModal-gpJeVEch.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-BZe3IkDU.js",
  "./assets/vendor-react-CwWCsGf-.js",
  "./assets/vendor-utils-BxtSeOJ5.js"
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
