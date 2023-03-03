function rawHtmlResponse(html) {
  const init = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  };
  return new Response(html, init);
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
  // request.body.json()
  const { headers } = request;
  const contentType = headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    let data = await request.json();
    if (data.heartbeat != true) {
      // do something
      return 'good';
    }
  } else {
    // Perhaps some other type of data was submitted in the form
    // like an image, or some other binary data.
    return '?';
  }
}

async function handleRequest(request) {
  const reqBody = await readRequestBody(request);
  const retBody = `The request body sent in was ${reqBody}`;
  return new Response(retBody);
}

addEventListener('fetch', event => {
  const { request } = event;
  if (request.method === 'POST') {
    return event.respondWith(handleRequest(request));
  } else if (request.method === 'GET') {
    return event.respondWith(new Response(`The request was a GET`));
  }
});

