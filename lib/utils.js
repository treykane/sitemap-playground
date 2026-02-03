const { URL } = require('url');

const ASSET_EXTENSIONS = new Set([
  'css',
  'js',
  'mjs',
  'map',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'avif',
  'ico',
  'mp4',
  'mp3',
  'wav',
  'ogg',
  'webm',
  'pdf',
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot'
]);

/**
 * Basic content-type check for HTML responses.
 */
function isHtml(contentType) {
  if (!contentType) return false;
  return contentType.toLowerCase().includes('text/html');
}

function isAssetUrl(url) {
  const pathname = url.pathname.toLowerCase();
  if (pathname.startsWith('/_next/')) return true;
  const lastSegment = pathname.split('/').pop() || '';
  const dotIndex = lastSegment.lastIndexOf('.');
  if (dotIndex <= 0) return false;
  const extension = lastSegment.slice(dotIndex + 1);
  return ASSET_EXTENSIONS.has(extension);
}

/**
 * Extract href links from raw HTML.
 * Note: regex-based parsing is best-effort and may miss edge cases.
 */
function extractLinks(html, baseUrl) {
  const links = [];
  const regex = /href\s*=\s*(["'])(.*?)\1/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const href = match[2];
    if (!href) continue;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    try {
      const url = new URL(href, baseUrl);
      if (isAssetUrl(url)) continue;
      links.push(url.toString());
    } catch (error) {
      // Skip invalid URLs.
    }
  }

  return links;
}

/**
 * Heuristic AMP URL detector.
 */
function isAmpUrl(url) {
  const pathname = url.pathname.toLowerCase();
  if (pathname.includes('/amp')) return true;
  if (url.searchParams.has('amp')) return true;
  return false;
}

module.exports = {
  extractLinks,
  isAmpUrl,
  isHtml,
  isAssetUrl
};
