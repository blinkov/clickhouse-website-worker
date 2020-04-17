export async function handlePlaygroundRequest(request: Request) {
  let url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) {
    return fetch(request);
  }
  let version_match = url.pathname.match(/\/api\/(v[0-9]+\.[0-9]+)\//);
  if (version_match && version_match.length > 1) {
    let version = version_match[1];
    url.pathname = url.pathname.replace(`/api/${version}/`, '/');
    version = version.replace('.', '-')
    url.hostname = `play-api-${version}.clickhouse.tech`;
  } else {
    url.hostname = 'play-api.clickhouse.tech';
    url.pathname = url.pathname.replace('/api/', '/');
  }

  url.port = '8443';


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
