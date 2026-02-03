const { URL } = require('url');

/**
 * Basic content-type check for HTML responses.
 */
function isHtml(contentType) {
  if (!contentType) return false;
  return contentType.toLowerCase().includes('text/html');
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
      const url = new URL(href, baseUrl).toString();
      links.push(url);
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
  isHtml
};
