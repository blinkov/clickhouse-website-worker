import { handleRequest } from './handler';
import config from './config';
import { changeUrl } from './util';
import { sendExceptionToSentry } from './sentry';

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event: FetchEvent) {
  try {
    let response;
    if (event.request.method.toLowerCase() == 'get') {
      response = await caches.default.match(event.request);
    }
    if (!response) {
      response = await handleRequest(event.request);
      cacheResponse(event, response);
    }
    return response;
  } catch (e) {
    event.waitUntil(sendExceptionToSentry(e, event.request));
    return fallbackResponse(event.request);
  }
}

async function fallbackResponse(request: Request): Promise<Response> {
  let url = new URL(request.url);
  url.hostname = config.origin;
  return await fetch(changeUrl(request, url));
}

function cacheResponse(event: FetchEvent, response: Response) {
  const to_cache = response.clone();
  to_cache.headers.set('cache-control', 'public, max-age=43200');
  event.waitUntil(caches.default.put(event.request, to_cache));
}