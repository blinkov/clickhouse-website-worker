import config from './config';

export function addDefaultHeaders(response: Response) {
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-xss-protection', '1; mode=block');
  response.headers.set(
    'content-security-policy',
    `default-src 'none'; script-src 'self' 'unsafe-eval' ajax.cloudflare.com static.cloudflareinsights.com *.algolia.net *.algolianet.com mc.yandex.ru; style-src 'self'; img-src 'self' data: mc.yandex.ru; connect-src 'self' mc.yandex.ru *.algolia.net *.algolianet.com; child-src blob: mc.yandex.ru; frame-src blob: mc.yandex.ru; font-src 'self' data:;`,
  );
  let location = response.headers.get('location');
  if (location && location.indexOf(config.origin) >= 0) {
    response.headers.set(
      'location',
      location.replace(config.origin, config.domain),
    );
  }
}

export function changeUrl(req: Request, new_url: URL): Request {
  const { headers, method, redirect, referrer, referrerPolicy, body } = req;

  return new Request(new_url.toString(), {
    headers,
    method,
    redirect,
    referrer,
    referrerPolicy,
    body,
  });
}
