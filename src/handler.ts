import { addDefaultHeaders, changeUrl } from './util';
import { handleCodebrowserRequest } from './codebrowser';
import { handleMeetFormRequest } from './meet_form';
import { handleMetrikaCounterRequest } from './metrika';
import { handlePlaygroundRequest } from './playground';
import config from './config';

let hostname_mapping = new Map([
  ['play.clickhouse.tech', handlePlaygroundRequest],
  ['birman111-test.clickhouse.tech', handlePlaygroundRequest],
]);

let pathname_mapping = new Map([
  ['/meet-form/', handleMeetFormRequest],
  ['/js/metrika.js', handleMetrikaCounterRequest],
]);

export async function handleRequest(request: Request): Promise<Response> {
  let url = new URL(request.url);
  let hostname_handler = hostname_mapping.get(url.hostname);
  if (hostname_handler) {
    return hostname_handler(request);
  }
  let pathname_handler = pathname_mapping.get(url.pathname);
  if (pathname_handler) {
    return pathname_handler(request);
  }
  if (url.pathname.startsWith('/codebrowser')) {
    return handleCodebrowserRequest(request);
  }
  url.hostname = config.origin;
  let response = await fetch(changeUrl(request, url));
  if (
    response.status === 200 &&
    url.pathname.startsWith('/docs') &&
    response.headers.get('content-type') === 'text/html; charset=utf-8'
  ) {
    let text = await response.text();
    let redirect_prefix = '<!--[if IE 6]> Redirect: ';
    if (text.startsWith(redirect_prefix)) {
      let target = new URL(request.url);
      target.pathname = text
        .substring(redirect_prefix.length)
        .split(' <![endif]-->', 1)[0];
      return Response.redirect(target.toString(), 301);
    } else {
      response = new Response(text, response);
      addDefaultHeaders(response);
      return response;
    }
  }
  if (response.status === 404) {
    let version_match = url.pathname.match(/^\/docs\/(v[0-9]+\.[0-9]+)\//);
    if (version_match && version_match.length > 1) {
      let target = new URL(request.url);
      target.pathname = url.pathname.replace(version_match[1] + '/', '');
      return Response.redirect(target.toString(), 301);
    }
  }
  response = new Response(response.body, response);
  if (
    url.pathname != '/benchmark.html' &&
    url.pathname != '/benchmark_hardware.html'
  ) {
    // TODO: get rid of exception for benchmarks
    addDefaultHeaders(response);
  }
  return response;
}
