const fs = require('fs');

/**
 * Write a single sitemap file.
 * @param {Array<{loc:string,priority?:number,lastmod?:string}>} entries
 * @param {object} options
 */
function writeSitemaps(entries, options) {
  const filepath = options.filepath;
  const xml = buildSitemapXml(entries);
  fs.writeFileSync(filepath, xml, 'utf8');
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
