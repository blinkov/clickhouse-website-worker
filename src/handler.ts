import { addDefaultHeaders, changeUrl } from './util';
import { handleMeetFormRequest } from './meet_form';
import { handlePlaygroundRequest } from './playground';
import config from './config';

let hostname_mapping = new Map([
  ['play.clickhouse.tech', handlePlaygroundRequest],
  ['birman111-test.clickhouse.tech', handlePlaygroundRequest],
]);

export async function handleRequest(request: Request): Promise<Response> {
  let url = new URL(request.url);

  let hostname_handler = hostname_mapping.get(url.hostname);
  if (hostname_handler) {
    return hostname_handler(request);
  }
  if (url.pathname === '/meet-form/') {
    return handleMeetFormRequest(request);
  }
  url.hostname = config.origin;
  let response = await fetch(changeUrl(request, url));
  if (
    response.status === 200 &&
    url.pathname.startsWith('/docs') &&
    response.headers.get('content-type') === 'text/html; charset=utf-8'
  ) {
    let text = await response.text();
    let redirect_prefix = '<!-- Redirect: ';
    if (text.startsWith(redirect_prefix)) {
      let headers = new Headers();
      headers.set(
        'location',
        text.substring(redirect_prefix.length).split(' -->', 1)[0],
      );
      return new Response('301 Moved Permanently', {
        status: 301,
        headers: headers,
      });
    } else {
      response = new Response(text, response);
      addDefaultHeaders(response);
      return response;
    }
  }
  response = new Response(response.body, response);
  addDefaultHeaders(response);
  return response;
}
