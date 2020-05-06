export async function handleMeetFormRequest(request: Request) {
  if (request.method != 'POST') {
    return new Response('Bad request', {
      status: 400,
      statusText: 'Bad request',
    });
  }
  const url = new URL('https://api.sendgrid.com/v3/mail/send');
  let newHdrs = new Headers();
  newHdrs.set('Authorization', 'Bearer ' + SENDGRID_TOKEN);
  newHdrs.set('Content-Type', 'application/json');
  let args = await request.json();
  let subject = args['name'] + ' wants to meet';
  let content = '';
  let argsKeys = Object.keys(args);
  if (
    ['name', 'email', 'city', 'company'].filter((n) => !argsKeys.includes(n))
      .length
  ) {
    return new Response('Bad request', {
      status: 400,
      statusText: 'Bad request',
    });
  }
  for (let key in args) {
    content += key.charAt(0).toUpperCase() + key.slice(1);
    content += ':\r\n' + args[key] + '\r\n\r\n';
  }
  const domain = 'yandex-team.ru';
  const body = {
    personalizations: [
      {
        to: [
          {
            email: 'clickhouse-feedback' + '@' + domain,
            name: 'ClickHouse Core Team',
          },
        ],
        subject: subject,
      },
    ],
    content: [
      {
        type: 'text/plain',
        value: content,
      },
    ],
    from: {
      email: 'no-reply@clickhouse.tech',
      name: 'ClickHouse Website',
    },
    reply_to: {
      email: 'no-reply@clickhouse.tech',
      name: 'ClickHouse Website',
    },
  };
  const init = {
    body: JSON.stringify(body),
    headers: newHdrs,
    method: 'POST',
  };

  let response = await fetch(url.toString(), init);
  let status = 200;
  if (response.status != 202) {
    status = 200;
  }

  return new Response('{}', {
    status: status,
    statusText: response.statusText.replace('Accepted', 'OK'),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
}
