import { handleRequest } from './handler';
import config from './config';
import { changeUrl } from './util';
import { sendExceptionToSentry } from './sentry';

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event: FetchEvent) {
  try {
    return await handleRequest(event.request);
  } catch (e) {
    event.waitUntil(sendExceptionToSentry(e));
    return fallbackResponse(event.request);
  }
}

function handleError(error: Error, event: FetchEvent) {
  event.respondWith(fallbackResponse(event.request));
  event.waitUntil(sendExceptionToSentry(error));
}

async function fallbackResponse(request: Request): Promise<Response> {
  let url = new URL(request.url);
  url.hostname = config.origin;
  return await fetch(changeUrl(request, url));
}
