// Auto-generated Service Worker for 100% Offline PWA Support
const CACHE_NAME = 'sweetbakery-v1794321721119';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/AiCakeAnalysisModal-CCcUwmh6.js",
  "./assets/AiDemandForecastModal-Bsx95U0F.js",
  "./assets/AppUpdateModal-BgimJjNp.js",
  "./assets/CakeFlavorsModal-DfYiGEhL.js",
  "./assets/CakeLabelPrintModal-CLge05My.js",
  "./assets/customerAiAssistantService-B1o1pQK_.js",
  "./assets/CustomerExpressOrderModal-CnACGs0z.js",
  "./assets/CustomerOrderLinkModal-BBWRqdos.js",
  "./assets/CustomerOrderPortal-BrcIIRrV.js",
  "./assets/CustomerShowcase-CCtfAtSn.js",
  "./assets/CustomOrderPipeline-BunIOsSr.js",
  "./assets/ExpenseManagement-BUXUleRt.js",
  "./assets/flavorUtils-bqTv1_ZW.js",
  "./assets/InAppChatModal-BGDOULT0.js",
  "./assets/index-BKtpST5Z.js",
  "./assets/index-S8hIAR0j.css",
  "./assets/InventoryManagement-fpjo6DSE.js",
  "./assets/KitchenDisplayModal-8DzrQvvp.js",
  "./assets/LicenseExpiredModal-hlEyKZr5.js",
  "./assets/LicenseRenewalModal-Mdwu7sxQ.js",
  "./assets/LoyaltyRewardsModal-BJth0y35.js",
  "./assets/NewCustomOrderModal-Rlv2WJZj.js",
  "./assets/ReportsDashboard-3MCCMSCb.js",
  "./assets/ReserveFundDashboard-CWmUU7xE.js",
  "./assets/ReserveFundModal-DTMSlSDs.js",
  "./assets/SalesHistory-BvpvkT4O.js",
  "./assets/SettingsModal-HM3fnoTz.js",
  "./assets/ShiftModal-B5_D2hOV.js",
  "./assets/SmartBirthdayCrmModal-DzKlFUwV.js",
  "./assets/StaffManagement-CvFn392O.js",
  "./assets/StoreAuthModal-BgovOETr.js",
  "./assets/SuperAdminPortalModal-B3dgbcz3.js",
  "./assets/ThemePickerModal-CcT1F2s_.js",
  "./assets/vendor-confetti-oQXWb4Lk.js",
  "./assets/vendor-firebase-DFjRPULu.js",
  "./assets/vendor-react-CxBtDDX_.js",
  "./assets/vendor-utils-g8O2Mb-j.js"
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
