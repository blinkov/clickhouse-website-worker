import { addDefaultHeaders, changeUrl } from './util';
import config from './config';

export async function handleCodebrowserRequest(request: Request): Promise<Response> {
  let url = new URL(request.url);
  url.hostname = config.codebrowser;
  let response = await fetch(changeUrl(request, url));
  if (response.headers.get('content-type') === 'text/html; charset=utf-8') {
    let text = await response.text();
    text = text.split('https://clickhouse-test-reports.s3.yandex.net/').join('/');
    text = text.split('a href=\'http').join('a rel=\'external nofollow noreferrer\' target=\'_blank\' href=\'http');
    text = text.split('..//').join('../');
    response = new Response(text, response);
  } else {
    response = new Response(response.body, response);
  }
  addDefaultHeaders(response);
  response.headers.delete('content-security-policy');
  response.headers.delete('x-robots-tag');
  return response;

}
