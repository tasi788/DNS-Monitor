async function changeDNS(bool) {
  // makes requests 

  // first to get record id
  const url = `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`
  let init = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cf_token}`
    }
  }
  let resp_ = await fetch(url + `?name=${dns_name}`, init)
  let resp = await resp_.json()
  let record_id = resp.result[0].id

  // if bool === true die
  // else === to home
  let body = {
    "type": "CNAME",
    "name": `${dns_name}`,
    "content": bool === true ? `${remote_server}` : `${home_lab}`,
    "ttl": 60,
    "proxied": true,
  }
  init = {
    body: JSON.stringify(body),
    method: 'PUT',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'Authorization': `Bearer ${cf_token}`
    },
  };
  console.log(init);
  let r = await fetch(url + `/${record_id}`, init);
  console.log(await r.json());
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
  // request.body.json()
  const {
    headers
  } = request;
  const contentType = headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    let data = await request.json();

    if (data.heartbeat != true) {
      // do something
      await changeDNS(true);
      return 'set to remote server'
    } else if (data.heartbeat === true) {
        await changeDNS(false)
        return 'set to home server';
    }
  } else {
    // Perhaps some other type of data was submitted in the form
    // like an image, or some other binary data.
    return '?';
  }
}

async function handleRequest(request) {
  const reqBody = await readRequestBody(request);
  return new Response(reqBody);
}

addEventListener('fetch', event => {
  const {
    request
  } = event;
  if (request.method === 'POST') {
    return event.respondWith(handleRequest(request));
  } else if (request.method === 'GET') {
    return event.respondWith(new Response(`The request was a GET`));
  }
});