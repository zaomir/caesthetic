(function () {
  'use strict';

  var registryPromise;

  function loadRegistry() {
    if (!registryPromise) {
      registryPromise = fetch('/media/registry.json', { credentials: 'same-origin' })
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
        var entry = entries[mediaId];
        if (!entry) {
          image.setAttribute('data-media-state', 'missing');
          return;
        }

        image.src = entry.src;
        image.alt = entry.alt || '';
        image.width = entry.width;
        image.height = entry.height;
        image.setAttribute('data-media-state', entry.state);
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

  window.CAESTHETIC_MEDIA = { load: loadRegistry, resolve: resolve };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { resolve(document); });
  } else {
    resolve(document);
  }
}());
