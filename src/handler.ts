import { addDefaultHeaders, changeUrl } from './util';
import { handleMeetFormRequest } from './meet_form';
import config from './config';

export async function handleRequest(request: Request): Promise<Response> {
  let url = new URL(request.url);
  if (url.pathname === '/meet-form/') {
    return handleMeetFormRequest(request);
  }
  url.hostname = config.origin;
  let response = await fetch(changeUrl(request, url));
  response = new Response(response.body, response);
  addDefaultHeaders(response);
  return response;
}
