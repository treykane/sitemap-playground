const { describe, it, mock } = require('node:test');
const assert = require('node:assert');
const { SimpleSiteCrawler } = require('../lib/crawler');

describe('SimpleSiteCrawler', () => {
  describe('normalizeUrl', () => {
    it('should normalize same-origin URLs', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        stripQuerystring: false
      });
      
      const normalized = crawler.normalizeUrl('https://example.com/page');
      assert.strictEqual(normalized, 'https://example.com/page');
    });

    it('should remove hash fragments', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        stripQuerystring: false
      });
      
      const normalized = crawler.normalizeUrl('https://example.com/page#section');
      assert.strictEqual(normalized, 'https://example.com/page');
    });

    it('should strip query strings when configured', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        stripQuerystring: true
      });
      
      const normalized = crawler.normalizeUrl('https://example.com/page?query=value');
      assert.strictEqual(normalized, 'https://example.com/page');
    });

    it('should preserve query strings when configured', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        stripQuerystring: false
      });
      
      const normalized = crawler.normalizeUrl('https://example.com/page?query=value');
      assert.strictEqual(normalized, 'https://example.com/page?query=value');
    });

    it('should reject cross-origin URLs', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1
      });
      
      const normalized = crawler.normalizeUrl('https://different.com/page');
      assert.strictEqual(normalized, null);
    });

    it('should reject non-http(s) protocols', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1
      });
      
      assert.strictEqual(crawler.normalizeUrl('ftp://example.com/page'), null);
      assert.strictEqual(crawler.normalizeUrl('mailto:test@example.com'), null);
    });

    it('should reject asset URLs', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1
      });
      
      assert.strictEqual(crawler.normalizeUrl('https://example.com/style.css'), null);
      assert.strictEqual(crawler.normalizeUrl('https://example.com/script.js'), null);
    });

    it('should reject AMP URLs when configured', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        ignoreAMP: true
      });
      
      assert.strictEqual(crawler.normalizeUrl('https://example.com/page/amp'), null);
    });

    it('should resolve relative URLs', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1
      });
      
      const normalized = crawler.normalizeUrl('/about');
      assert.strictEqual(normalized, 'https://example.com/about');
    });
  });

  describe('isIgnored', () => {
    it('should return false when no ignore function is provided', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1
      });
      
      assert.strictEqual(crawler.isIgnored('https://example.com/page'), false);
    });

    it('should use custom ignore function when provided', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        ignore: (url) => url.includes('/admin/')
      });
      
      assert.strictEqual(crawler.isIgnored('https://example.com/admin/page'), true);
      assert.strictEqual(crawler.isIgnored('https://example.com/public/page'), false);
    });
  });

  describe('buildEntry', () => {
    it('should build entry with URL and priority', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 2,
        priorityMap: [1.0, 0.8, 0.5]
      });
      
      const entry = crawler.buildEntry('https://example.com/page', 1, {});
      assert.strictEqual(entry.loc, 'https://example.com/page');
      assert.strictEqual(entry.priority, 0.8);
    });

    it('should use last priority value for depths beyond the map', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 5,
        priorityMap: [1.0, 0.8, 0.5]
      });
      
      const entry = crawler.buildEntry('https://example.com/deep', 10, {});
      assert.strictEqual(entry.priority, 0.5);
    });

    it('should include lastmod when configured and header is present', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        priorityMap: [1.0],
        lastMod: true
      });
      
      const headers = {
        'last-modified': 'Mon, 01 Jan 2024 00:00:00 GMT'
      };
      
      const entry = crawler.buildEntry('https://example.com/page', 0, headers);
      assert.ok(entry.lastmod);
      assert.ok(entry.lastmod.includes('2024-01-01'));
    });

    it('should not include lastmod when header is invalid', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        priorityMap: [1.0],
        lastMod: true
      });
      
      const headers = {
        'last-modified': 'invalid-date'
      };
      
      const entry = crawler.buildEntry('https://example.com/page', 0, headers);
      assert.strictEqual(entry.lastmod, undefined);
    });

    it('should not include lastmod when not configured', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1,
        priorityMap: [1.0],
        lastMod: false
      });
      
      const headers = {
        'last-modified': 'Mon, 01 Jan 2024 00:00:00 GMT'
      };
      
      const entry = crawler.buildEntry('https://example.com/page', 0, headers);
      assert.strictEqual(entry.lastmod, undefined);
    });
  });

  describe('event emission', () => {
    it('should be an EventEmitter', () => {
      const crawler = new SimpleSiteCrawler('https://example.com', {
        maxDepth: 1
      });
      
      assert.ok(typeof crawler.on === 'function');
      assert.ok(typeof crawler.emit === 'function');
    });
  });
});
