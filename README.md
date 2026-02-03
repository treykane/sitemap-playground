# Sitemap Playground

This repo is a small Node.js script that crawls a site and writes a `sitemap.xml`
using a built-in crawler (no external sitemap library).

## What It Does

The script in `crawler.js`:

- Sets a base URL (`https://treykane.com`).
- Crawls that site (respecting `robots.txt` disallow rules for `*`).
- Writes a sitemap to `./sitemap.xml`.
- Splits into multiple sitemap files when the entry limit is exceeded.
- Logs each URL as it is added.
- Logs any URL that was ignored (robots or ignore rules).
- Logs errors during crawling.

## How It Works (Key Options)

The crawler options in `crawler.js`:

- `httpsAgent: https.globalAgent`
  Uses Node's global HTTPS agent for requests (from the `https` module).
- `maxDepth: 0`
  Depth 0 means only the start URL is crawled (no following links).
- `filepath: './sitemap.xml'`
  Output path for the generated sitemap or sitemap index.
- `maxEntriesPerFile: 50000`
  Splits into multiple sitemap files if needed (creates a sitemap index at `filepath`).
- `stripQuerystring: true`
  Removes query strings from URLs.
- `ignoreAMP: true`
  Skips AMP URLs (simple path/query detection).
- `lastMod: true`
  Includes `lastmod` timestamps if available via the `Last-Modified` header.
- `priorityMap: [1.0, 0.5, 0.2, 0]`
  Priority by depth (from root to deeper pages).
- `ignore: url => /<pattern>/g.test(url)`
  Skip any URLs matching the provided pattern (replace `<pattern>` with your own).

Event listeners:

- `done` logs when the crawl finishes.
- `add` logs each URL added to the sitemap.
- `error` logs crawl errors.
- `ignore` logs URLs skipped due to robots.txt or ignore rules.

## Project Layout

- `crawler.js` holds configuration and starts the crawl.
- `lib/crawler.js` contains the crawler class and orchestration logic.
- `lib/http.js` handles HTTP/HTTPS fetching with redirects.
- `lib/robots.js` parses `robots.txt` disallow rules.
- `lib/sitemap.js` writes sitemap files and indexes.
- `lib/utils.js` includes link extraction and helpers.

## Setup

```bash
npm install
```

## Run

```bash
node crawler.js
```

Notes:

- `npm test` currently points to a `crawl` script, which runs the crawler.
- The sitemap will be written to `./sitemap.xml` (overwritten each run).

## Customize

- Change `baseUrl` in `crawler.js` to crawl a different site.
- Update the `ignore` regex to exclude URLs you do not want in the sitemap.
- Increase `maxDepth` to crawl deeper links.
