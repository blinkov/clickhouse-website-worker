import { addDefaultHeaders, changeUrl } from './util';

export async function handleMetrikaCounterRequest(request: Request): Promise<Response> {
  let url = new URL('https://mc.yandex.ru/metrika/tag.js');
  let cf = { cf: { cacheEverything: true, cacheTtl: 86400, minify: { javascript: true, css: false, html: false }}};
  return fetch(changeUrl(request, url), cf);
}
