const { describe, it } = require('node:test');
const assert = require('node:assert');
const { writeSitemaps } = require('../lib/sitemap');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('sitemap', () => {
  describe('writeSitemaps', () => {
    it('should write a valid sitemap XML file', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-test-'));
      const filepath = path.join(tmpDir, 'test-sitemap.xml');
      
      const entries = [
        { loc: 'https://example.com/', priority: 1.0 },
        { loc: 'https://example.com/about', priority: 0.8 }
      ];
      
      const options = { filepath };
      writeSitemaps(entries, options);
      
      const content = fs.readFileSync(filepath, 'utf8');
      
      // Check XML declaration
      assert.ok(content.includes('<?xml version="1.0" encoding="UTF-8"?>'));
      
      // Check urlset with namespace
      assert.ok(content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
      
      // Check URLs are present
      assert.ok(content.includes('<loc>https://example.com/</loc>'));
      assert.ok(content.includes('<loc>https://example.com/about</loc>'));
      
      // Check priorities
      assert.ok(content.includes('<priority>1.0</priority>'));
      assert.ok(content.includes('<priority>0.8</priority>'));
      
      // Cleanup
      fs.unlinkSync(filepath);
      fs.rmdirSync(tmpDir);
    });

    it('should include lastmod when provided', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-test-'));
      const filepath = path.join(tmpDir, 'test-sitemap.xml');
      
      const entries = [
        { 
          loc: 'https://example.com/', 
          priority: 1.0,
          lastmod: '2024-01-01T00:00:00.000Z'
        }
      ];
      
      const options = { filepath };
      writeSitemaps(entries, options);
      
      const content = fs.readFileSync(filepath, 'utf8');
      assert.ok(content.includes('<lastmod>2024-01-01T00:00:00.000Z</lastmod>'));
      
      // Cleanup
      fs.unlinkSync(filepath);
      fs.rmdirSync(tmpDir);
    });

    it('should escape XML special characters in URLs', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-test-'));
      const filepath = path.join(tmpDir, 'test-sitemap.xml');
      
      const entries = [
        { 
          loc: 'https://example.com/page?foo=bar&baz=qux',
          priority: 1.0
        }
      ];
      
      const options = { filepath };
      writeSitemaps(entries, options);
      
      const content = fs.readFileSync(filepath, 'utf8');
      
      // & should be escaped to &amp;
      assert.ok(content.includes('foo=bar&amp;baz=qux'));
      
      // Cleanup
      fs.unlinkSync(filepath);
      fs.rmdirSync(tmpDir);
    });

    it('should handle empty entries array', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-test-'));
      const filepath = path.join(tmpDir, 'test-sitemap.xml');
      
      const entries = [];
      const options = { filepath };
      writeSitemaps(entries, options);
      
      const content = fs.readFileSync(filepath, 'utf8');
      
      // Should still have valid XML structure
      assert.ok(content.includes('<?xml version="1.0" encoding="UTF-8"?>'));
      assert.ok(content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
      assert.ok(content.includes('</urlset>'));
      
      // Cleanup
      fs.unlinkSync(filepath);
      fs.rmdirSync(tmpDir);
    });
  });
});
