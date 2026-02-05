const { describe, it } = require('node:test');
const assert = require('node:assert');
const { extractLinks, isAmpUrl, isHtml, isAssetUrl } = require('../lib/utils');
const { URL } = require('url');

describe('utils', () => {
  describe('isHtml', () => {
    it('should return true for text/html content type', () => {
      assert.strictEqual(isHtml('text/html'), true);
    });

    it('should return true for text/html with charset', () => {
      assert.strictEqual(isHtml('text/html; charset=utf-8'), true);
    });

    it('should return true for text/html in uppercase', () => {
      assert.strictEqual(isHtml('TEXT/HTML'), true);
    });

    it('should return false for non-HTML content types', () => {
      assert.strictEqual(isHtml('application/json'), false);
      assert.strictEqual(isHtml('text/plain'), false);
      assert.strictEqual(isHtml('image/png'), false);
    });

    it('should return false for undefined or null', () => {
      assert.strictEqual(isHtml(undefined), false);
      assert.strictEqual(isHtml(null), false);
    });
  });

  describe('isAssetUrl', () => {
    it('should return true for common asset extensions', () => {
      assert.strictEqual(isAssetUrl(new URL('https://example.com/style.css')), true);
      assert.strictEqual(isAssetUrl(new URL('https://example.com/script.js')), true);
      assert.strictEqual(isAssetUrl(new URL('https://example.com/image.png')), true);
      assert.strictEqual(isAssetUrl(new URL('https://example.com/font.woff2')), true);
      assert.strictEqual(isAssetUrl(new URL('https://example.com/video.mp4')), true);
    });

    it('should return true for _next paths', () => {
      assert.strictEqual(isAssetUrl(new URL('https://example.com/_next/static/file.js')), true);
    });

    it('should return false for HTML pages', () => {
      assert.strictEqual(isAssetUrl(new URL('https://example.com/page.html')), false);
      assert.strictEqual(isAssetUrl(new URL('https://example.com/about')), false);
      assert.strictEqual(isAssetUrl(new URL('https://example.com/')), false);
    });

    it('should handle paths with multiple dots', () => {
      assert.strictEqual(isAssetUrl(new URL('https://example.com/bundle.min.js')), true);
    });
  });

  describe('isAmpUrl', () => {
    it('should return true for URLs with /amp in pathname', () => {
      assert.strictEqual(isAmpUrl(new URL('https://example.com/article/amp')), true);
      assert.strictEqual(isAmpUrl(new URL('https://example.com/amp/page')), true);
    });

    it('should return true for URLs with amp query parameter', () => {
      const url = new URL('https://example.com/article?amp=1');
      assert.strictEqual(isAmpUrl(url), true);
    });

    it('should return false for non-AMP URLs', () => {
      assert.strictEqual(isAmpUrl(new URL('https://example.com/article')), false);
      assert.strictEqual(isAmpUrl(new URL('https://example.com/example')), false);
    });

    it('should be case insensitive for pathname', () => {
      assert.strictEqual(isAmpUrl(new URL('https://example.com/article/AMP')), true);
    });
  });

  describe('extractLinks', () => {
    it('should extract simple href links', () => {
      const html = '<a href="https://example.com/page1">Link</a>';
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 1);
      assert.strictEqual(links[0], 'https://example.com/page1');
    });

    it('should extract multiple links', () => {
      const html = `
        <a href="https://example.com/page1">Link 1</a>
        <a href="https://example.com/page2">Link 2</a>
      `;
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 2);
      assert.ok(links.includes('https://example.com/page1'));
      assert.ok(links.includes('https://example.com/page2'));
    });

    it('should resolve relative URLs', () => {
      const html = '<a href="/about">About</a>';
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 1);
      assert.strictEqual(links[0], 'https://example.com/about');
    });

    it('should skip mailto: links', () => {
      const html = '<a href="mailto:test@example.com">Email</a>';
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 0);
    });

    it('should skip tel: links', () => {
      const html = '<a href="tel:+1234567890">Call</a>';
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 0);
    });

    it('should skip javascript: links', () => {
      const html = '<a href="javascript:void(0)">Click</a>';
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 0);
    });

    it('should skip asset URLs', () => {
      const html = `
        <a href="/style.css">CSS</a>
        <a href="/script.js">JS</a>
        <a href="/page">Page</a>
      `;
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 1);
      assert.strictEqual(links[0], 'https://example.com/page');
    });

    it('should handle single and double quotes', () => {
      const html = `
        <a href='https://example.com/single'>Single</a>
        <a href="https://example.com/double">Double</a>
      `;
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 2);
    });

    it('should handle empty hrefs', () => {
      const html = '<a href="">Empty</a>';
      const links = extractLinks(html, 'https://example.com');
      assert.strictEqual(links.length, 0);
    });
  });
});
