// This service worker caches index.html, so that the page loads instantly and works offline.

const cacheVersion = "v1";

async function addResourcesToCache(resources) {
  const cache = await caches.open(cacheVersion);
  await cache.addAll(resources);
}

// TODO(philc): Check if a resource is out of date
// https://www.perplexity.ai/search/when-fetching-a-resource-in-a-iZ6exrxRRhm3Ca_TF4wZ1w

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/",
      "/index.html",
    ]),
  );
});

// NOTE(philc): If a new service worker is installed, I don't think we necessarily want it to
// claim existing clients.
// self.addEventListener("activate", () => {
//   clients.claim();
// });

async function putInCache(request, response) {
  const cache = await caches.open(cacheVersion);
  await cache.put(request, response);
}

async function cacheFirst({ request, event }) {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    // Save a clone of the response into the cache, and serve the original.
    event.waitUntil(putInCache(request, responseFromNetwork.clone()));
    return responseFromNetwork;
  } catch (error) {
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  // TODO(philc): Use await here?
  event.respondWith(
    cacheFirst({
      request: event.request,
      event,
    }),
  );
});
