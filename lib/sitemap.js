const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/**
 * Write a sitemap file, or split + index if it exceeds the per-file limit.
 * @param {Array<{loc:string,priority?:number,lastmod?:string}>} entries
 * @param {object} options
 * @param {string} baseUrl
 */
function writeSitemaps(entries, options, baseUrl) {
  const filepath = options.filepath;
  const maxEntries = options.maxEntriesPerFile || 50000;

  if (entries.length <= maxEntries) {
    const xml = buildSitemapXml(entries);
    fs.writeFileSync(filepath, xml, 'utf8');
    return;
  }

  const parsed = path.parse(filepath);
  const chunks = chunkEntries(entries, maxEntries);
  const chunkFiles = [];

  chunks.forEach((chunk, index) => {
    const filename = `${parsed.name}-${index + 1}${parsed.ext}`;
    const fullpath = path.join(parsed.dir, filename);
    const xml = buildSitemapXml(chunk);
    fs.writeFileSync(fullpath, xml, 'utf8');
    chunkFiles.push(filename);
  });

  const indexXml = buildSitemapIndexXml(chunkFiles, baseUrl, options.lastMod);
  fs.writeFileSync(filepath, indexXml, 'utf8');
}

function buildSitemapXml(entries) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const entry of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    if (entry.priority !== undefined) {
      lines.push(`    <priority>${Number(entry.priority).toFixed(1)}</priority>`);
    }
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

function buildSitemapIndexXml(files, baseUrl, includeLastMod) {
  const lines = [];
  const now = new Date().toISOString();
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  files.forEach((filename) => {
    const loc = new URL(filename, baseUrl).toString();
    lines.push('  <sitemap>');
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    if (includeLastMod) {
      lines.push(`    <lastmod>${escapeXml(now)}</lastmod>`);
    }
    lines.push('  </sitemap>');
  });
  lines.push('</sitemapindex>');
  lines.push('');
  return lines.join('\n');
}

function chunkEntries(entries, size) {
  const chunks = [];
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(entries.slice(i, i + size));
  }
  return chunks;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = {
  writeSitemaps
};
