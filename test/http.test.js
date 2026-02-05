const { describe, it } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { fetchUrl } = require('../lib/http');

describe('http', () => {
  describe('fetchUrl', () => {
    it('should return response with required properties', async () => {
      // Create a simple test server
      const server = http.createServer((req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Last-Modified': 'Mon, 01 Jan 2024 00:00:00 GMT'
        });
        res.end('<html><body>Test</body></html>');
      });

      await new Promise((resolve) => {
        server.listen(0, resolve);
      });

      const port = server.address().port;
      const testUrl = `http://localhost:${port}/test`;

      const response = await fetchUrl(testUrl);

      assert.strictEqual(response.statusCode, 200);
      assert.ok(response.headers);
      assert.ok(response.body);
      assert.strictEqual(response.headers['content-type'], 'text/html');
      assert.ok(response.body.includes('Test'));

      server.close();
    });

    it('should follow redirects', async () => {
      const server = http.createServer((req, res) => {
        if (req.url === '/redirect') {
          res.writeHead(301, { Location: '/final' });
          res.end();
        } else if (req.url === '/final') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><body>Final</body></html>');
        }
      });

      await new Promise((resolve) => {
        server.listen(0, resolve);
      });

      const port = server.address().port;
      const testUrl = `http://localhost:${port}/redirect`;

      const response = await fetchUrl(testUrl);

      assert.strictEqual(response.statusCode, 200);
      assert.ok(response.body.includes('Final'));

      server.close();
    });

    it('should handle 404 errors', async () => {
      const server = http.createServer((req, res) => {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('Not Found');
      });

      await new Promise((resolve) => {
        server.listen(0, resolve);
      });

      const port = server.address().port;
      const testUrl = `http://localhost:${port}/notfound`;

      const response = await fetchUrl(testUrl);

      assert.strictEqual(response.statusCode, 404);

      server.close();
    });

    it('should limit redirects to 5 hops', async () => {
      let redirectCount = 0;
      const server = http.createServer((req, res) => {
        redirectCount++;
        if (redirectCount <= 10) {
          res.writeHead(301, { Location: `/redirect${redirectCount}` });
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('Final');
        }
      });

      await new Promise((resolve) => {
        server.listen(0, resolve);
      });

      const port = server.address().port;
      const testUrl = `http://localhost:${port}/redirect1`;

      const response = await fetchUrl(testUrl);

      // Should stop at redirect limit (after 6 requests: initial + 5 redirects)
      assert.ok(response.statusCode >= 300 && response.statusCode < 400);
      assert.strictEqual(redirectCount, 6); // Initial request + 5 redirects

      server.close();
    });
  });
});
