import url from 'url';

function parseRequest(req) {
  const { pathname, query } = url.parse(req.url, true); // Parse the URL and query string
  const method = req.method.toUpperCase(); // Normalize the HTTP method
  return { pathname, method, query };
}


function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString(); // Append data chunks
    });

    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body); // Parse JSON body
        resolve(parsedBody);
      } catch (err) {
        reject(new Error('Invalid JSON')); // Handle invalid JSON
      }
    });

    req.on('error', reject);
  });
}

export { parseRequestBody, parseRequest };
