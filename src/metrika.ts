import { addDefaultHeaders, changeUrl } from './util';

export async function handleMetrikaCounterRequest(request: Request): Promise<Response> {
  let url = new URL('https://mc.yandex.ru/metrika/tag.js');
  let cf = { cf: { cacheEverything: true, cacheTtl: 86400, minify: { javascript: true, css: false, html: false }}};
  let response = await fetch(changeUrl(request, url), cf);
  response = new Response(response.body, response)
  addDefaultHeaders(response);
  response.headers.set('cache-control', 'public, max-age=259200');
  response.headers.delete('expires');
  response.headers.delete('access-control-allow-origin');
  return response;

}
