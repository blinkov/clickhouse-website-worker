export async function handlePlaygroundRequest(request: Request) {
  let url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) {
    return fetch(request);
  }
  url.hostname = 'play-api.clickhouse.tech';
  url.port = '8443';
  url.pathname = url.pathname.replace('/api/', '/');

  const init = {
    body: request.body,
    headers: request.headers,
    method: request.method,
  };

  let response = await fetch(url.toString(), init);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
  });
}
