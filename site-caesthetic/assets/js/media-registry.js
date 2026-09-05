(function () {
  'use strict';

  var registryPromise;

  function loadRegistry() {
    if (!registryPromise) {
      registryPromise = fetch('/media/registry.json?v=case-library-wave2-20260905', { credentials: 'same-origin' })
        .then(function (response) {
          if (!response.ok) throw new Error('Media registry unavailable');
          return response.json();
        });
    }
    return registryPromise;
  }

  function resolve(root) {
    var scope = root || document;
    return loadRegistry().then(function (registry) {
      var entries = registry.entries || {};
      var images = scope.querySelectorAll('img[data-media-id]');

      images.forEach(function (image) {
        var mediaId = image.getAttribute('data-media-id');
        var fallbackId = image.getAttribute('data-media-fallback');
        var entry = entries[mediaId] || (fallbackId ? entries[fallbackId] : null);
        if (!entry) {
          image.setAttribute('data-media-state', 'missing');
          return;
        }

        image.src = entry.src;
        if (entry.alt) image.alt = entry.alt;
        image.width = entry.width;
        image.height = entry.height;
        image.setAttribute('data-media-state', entry.state);
      });

      scope.querySelectorAll('a[data-media-link]').forEach(function (link) {
        var entry = entries[link.getAttribute('data-media-link')];
        if (entry && entry.state === 'approved' && entry.src && entry.src.charAt(0) === '/' && entry.src.charAt(1) !== '/') {
          link.href = entry.src;
        }
      });

      document.dispatchEvent(new CustomEvent('cae:media-ready', { detail: { registry: registry } }));
      return registry;
    }).catch(function () {
      scope.querySelectorAll('img[data-media-id]').forEach(function (image) {
        image.setAttribute('data-media-state', 'error');
      });
      return null;
    });
  }

  window.CAESTHETIC_MEDIA = {
    load: loadRegistry,
    resolve: resolve,
    coverMediaId: function (item) {
      return item && item.id ? 'case.' + item.id + '.cover' : '';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { resolve(document); });
  } else {
    resolve(document);
  }
}());
