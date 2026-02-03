const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Fetch a URL and follow redirects (up to 5 hops).
 * @param {string} targetUrl
 * @param {import('http').Agent | import('https').Agent | undefined} agent
 * @param {number} redirectCount
 * @returns {Promise<{statusCode:number,statusMessage:string,headers:object,body:string}>}
 */
function fetchUrl(targetUrl, agent, redirectCount = 0) {
  const url = new URL(targetUrl);
  const client = url.protocol === 'http:' ? http : https;
  const requestOptions = {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    path: `${url.pathname}${url.search}`,
    agent
  };

  return new Promise((resolve, reject) => {
    const req = client.get(requestOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const status = res.statusCode || 0;
        const location = res.headers.location;
        if (status >= 300 && status < 400 && location) {
          if (redirectCount >= 5) {
            resolve({
              statusCode: status,
              statusMessage: res.statusMessage || 'Too many redirects',
              headers: res.headers,
              body: Buffer.concat(chunks).toString('utf8')
            });
            return;
          }
          try {
            const nextUrl = new URL(location, targetUrl).toString();
            resolve(fetchUrl(nextUrl, agent, redirectCount + 1));
            return;
          } catch (error) {
            // Fall through to resolving the current response.
          }
        }
        resolve({
          statusCode: status,
          statusMessage: res.statusMessage || '',
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8')
        });
      });
    });
    req.on('error', reject);
  });
}

module.exports = {
  fetchUrl
};
