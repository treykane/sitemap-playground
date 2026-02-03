const { EventEmitter } = require('events');
const { URL } = require('url');
const { fetchUrl } = require('./http');
const { renderUrl, closeBrowser } = require('./render');
const { parseRobots } = require('./robots');
const { writeSitemaps } = require('./sitemap');
const { extractLinks, isAmpUrl, isHtml, isAssetUrl } = require('./utils');

class SimpleSitemapCrawler extends EventEmitter {
  /**
   * @param {string} startUrl - The URL to begin crawling from.
   * @param {object} options - Crawler configuration (see README for details).
   */
  constructor(startUrl, options) {
    super();
    this.baseUrl = startUrl;
    this.baseOrigin = new URL(startUrl).origin;
    this.options = options;
    this.visited = new Set();
    this.entries = [];
    this.disallowRules = [];
  }

  /**
   * Kick off the crawl: load robots rules, visit pages, then write the sitemap.
   */
  async start() {
    try {
      await this.loadRobots();
      await this.crawl();
      writeSitemaps(this.entries, this.options, this.baseUrl);
      this.emit('done');
    } catch (error) {
      this.emit('error', error);
    } finally {
      if (this.options.renderWithJs) {
        await closeBrowser();
      }
    }
  }

  /**
   * Fetch and parse robots.txt for `User-agent: *`.
   * Missing/invalid robots files are treated as "no rules".
   */
  async loadRobots() {
    const robotsUrl = new URL('/robots.txt', this.baseUrl).toString();
    try {
      const res = await fetchUrl(robotsUrl, this.options.httpsAgent);
      if (res.statusCode >= 400) return;
      this.disallowRules = parseRobots(res.body);
    } catch (error) {
      // If robots.txt is unavailable, continue without rules.
    }
  }

  /**
   * Breadth-first crawl (queue-based) honoring depth, robots, and ignore rules.
   */
  async crawl() {
    const queue = [{ url: this.baseUrl, depth: 0 }];
    while (queue.length > 0) {
      const { url, depth } = queue.shift();
      const normalized = this.normalizeUrl(url);
      if (!normalized) continue;
      if (this.visited.has(normalized)) continue;

      if (this.isIgnored(normalized)) {
        this.emit('ignore', normalized);
        this.visited.add(normalized);
        continue;
      }

      if (this.isDisallowed(normalized)) {
        this.emit('ignore', normalized);
        this.visited.add(normalized);
        continue;
      }

      this.visited.add(normalized);

      const res = this.options.renderWithJs
        ? await renderUrl(normalized, {
          waitUntil: this.options.renderWaitUntil,
          timeoutMs: this.options.renderTimeoutMs,
          userAgent: this.options.userAgent,
          expandAllDetails: this.options.renderExpandAllDetails,
          expandAria: this.options.renderExpandAria,
          expandSelectors: this.options.renderExpandSelectors,
          expandWaitMs: this.options.renderExpandWaitMs
        })
        : await fetchUrl(normalized, this.options.httpsAgent);
      if (res.statusCode >= 400) {
        this.emit('error', {
          code: res.statusCode,
          message: res.statusMessage,
          url: normalized
        });
        continue;
      }

      const contentType = res.headers['content-type'];
      if (!isHtml(contentType)) {
        continue;
      }

      const entry = this.buildEntry(normalized, depth, res.headers);
      this.entries.push(entry);
      this.emit('add', normalized);

      if (depth >= this.options.maxDepth) continue;

      const links = extractLinks(res.body, normalized);
      for (const link of links) {
        if (!link) continue;
        const child = this.normalizeUrl(link);
        if (!child) continue;
        if (this.visited.has(child)) continue;
        queue.push({ url: child, depth: depth + 1 });
      }
    }
  }

  /**
   * Normalize and filter URLs so we only crawl same-origin, http(s) links.
   * @returns {string|null} Normalized URL string or null if it should be ignored.
   */
  normalizeUrl(raw) {
    try {
      const url = new URL(raw, this.baseUrl);
      if (url.origin !== this.baseOrigin) return null;
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      if (isAssetUrl(url)) return null;
      url.hash = '';
      if (this.options.stripQuerystring) url.search = '';
      if (this.options.ignoreAMP && isAmpUrl(url)) return null;
      return url.toString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Apply user-provided ignore rule (if any).
   */
  isIgnored(url) {
    if (typeof this.options.ignore === 'function') {
      return this.options.ignore(url);
    }
    return false;
  }

  /**
   * Check robots.txt disallow rules against the URL pathname.
   */
  isDisallowed(url) {
    if (!this.disallowRules.length) return false;
    const pathname = new URL(url).pathname;
    return this.disallowRules.some((rule) => {
      if (!rule) return false;
      if (rule === '/') return true;
      return pathname.startsWith(rule);
    });
  }

  /**
   * Build a sitemap entry, including priority and optional lastmod.
   */
  buildEntry(url, depth, headers) {
    const priority = this.options.priorityMap[depth] ?? this.options.priorityMap[this.options.priorityMap.length - 1] ?? 0.5;
    const entry = {
      loc: url,
      priority: Number(priority)
    };
    if (this.options.lastMod) {
      const lastMod = headers['last-modified'];
      if (lastMod) {
        const date = new Date(lastMod);
        if (!Number.isNaN(date.getTime())) {
          entry.lastmod = date.toISOString();
        }
      }
    }
    return entry;
  }
}

module.exports = {
  SimpleSitemapCrawler
};
