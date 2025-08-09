// This service worker caches index.html, so that the page loads instantly and works offline.
const pageHtml = `
<!DOCTYPE html>
<!-- This HTML must be kept in sync between index.html and service_worker.js -->
<html>
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="data:,">
    <meta name="color-scheme" content="light dark">
    <title>New Tab</title>
  </head>

  <body>
    <!--
      In Chrome, empirically we must put some content in the body to avoid the browser delaying the
      rendering of the page and the painting of the page's background color. The delay can be up to
      1 second and makes the page appear sluggish, as if it's not yet loaded. This delay appears to
      be a Chrome rendering pipeline optimization for the typical website.

      For this, we use transparent blank 1x1 GIF. Some text would also suffice.
    -->
    <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">
  </body>

  <script>
    async function registerServiceWorker() {
      try {
        await navigator.serviceWorker.register("./service_worker.js");
      } catch (error) {
        console.error("Service worker registration failed with error", error);
      }
    }
    registerServiceWorker();
  </script>
</html>
`;

self.addEventListener("fetch", (event) => {
  // We could serve index.html from the cache using `await caches.match(request)`. However, this
  // takes remarkably long in Chrome as of 2025-08-09, such that there is a 1 second delay before
  // the page is shown and ready for keyboard input. This is not the case with Firefox: the catched
  // page is found and returned instantly. As a workaround, we just return the hardcoded contents of
  // index.html without checking the cache.
  const url = new URL(event.request.url);
  if (url.pathname === "/new_tab_page/index.html" || url.pathname == "/new_tab_page/") {
    event.respondWith(
      new Response(pageHtml, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );
    return;
  }
  // Otherwise, let the browser handle the fetch request.
});
