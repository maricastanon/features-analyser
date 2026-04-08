/* ═══════════════════════════════════════════════════════════════
   Service Worker — Feature Brainstorm Hub
   Cache app shell relative to /src so the repo layout works as-is.
   ═══════════════════════════════════════════════════════════════ */
const CACHE_VERSION = 'v4.1.0';
const CACHE_SHELL = 'shell-' + CACHE_VERSION;
const CACHE_VENDOR = 'vendor-' + CACHE_VERSION;
const CACHE_FONTS = 'fonts-' + CACHE_VERSION;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/vars.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/features.css',
  './css/mockups.css',
  './css/css-editor.css',
  './css/data-flow.css',
  './css/code-editor.css',
  './css/inspector.css',
  './css/integration-guide.css',
  './css/project-config.css',
  './css/responsive.css',
  './js/utils/Debounce.js',
  './js/utils/DOM.js',
  './js/utils/FileIO.js',
  './js/core/EventBus.js',
  './js/core/Toast.js',
  './js/core/Store.js',
  './js/core/Theme.js',
  './js/core/App.js',
  './js/project/ProjectConfig.js',
  './js/project/ProjectSwitcher.js',
  './js/features/Categories.js',
  './js/features/Features.js',
  './js/features/AIPrompt.js',
  './js/improvements/Improvements.js',
  './js/implementation/Implementation.js',
  './js/mockups/Sandbox.js',
  './js/mockups/ModuleRegistry.js',
  './js/mockups/BundledModules.js',
  './js/mockups/ModuleIntelligence.js',
  './js/mockups/MockupManager.js',
  './js/css-editor/CSSVarExtractor.js',
  './js/css-editor/CSSControls.js',
  './js/css-editor/CSSEditor.js',
  './js/css-editor/CSSExporter.js',
  './js/integration/UIPatterns.js',
  './js/integration/CodeGenerator.js',
  './js/integration/IntegrationGuide.js',
  './js/integration/StepByStep.js',
  './js/data-flow/ProxyTracker.js',
  './js/data-flow/FlowGraph.js',
  './js/data-flow/FlowRecorder.js',
  './js/data-flow/DataFlow.js',
  './js/algorithm/AlgorithmPanel.js',
  './js/algorithm/PythonRunner.js',
  './js/algorithm/DiffView.js',
  './js/inspector/TreeView.js',
  './js/inspector/ChangeTracker.js',
  './js/inspector/Inspector.js',
  './js/guide/GuidePanel.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then(cache =>
      cache.addAll(SHELL_FILES).catch(err => {
        console.warn('[SW] Some shell files failed to cache:', err);
        return Promise.allSettled(SHELL_FILES.map(file => cache.add(file)));
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_SHELL && key !== CACHE_VENDOR && key !== CACHE_FONTS)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_FONTS));
    return;
  }

  if (url.pathname.includes('/vendor/')) {
    event.respondWith(cacheFirst(event.request, CACHE_VENDOR));
    return;
  }

  event.respondWith(cacheFirst(event.request, CACHE_SHELL));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}
