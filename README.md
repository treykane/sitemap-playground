# Sitemap Playground

This repo is a small Node.js script that crawls a site and writes a `sitemap.xml`
using the `sitemap-generator` package and Node's built-in `https` module.

## What It Does

The script in `crawler.js`:

- Sets a base URL (`https://treykane.com`).
- Crawls that site (respecting robots.txt).
- Writes a sitemap to `./sitemap.xml`.
- Logs each URL as it is added.
- Logs any URL that was ignored.
- Logs errors during crawling.

## How It Works (Key Options)

`SitemapGenerator(baseUrl, options)` is configured with:

- `httpsAgent: https.globalAgent`  
  Uses Node's global HTTPS agent for requests (from the `https` module).
- `maxDepth: 0`  
  Depth 0 means only the start URL is crawled (no following links).
- `filepath: './sitemap.xml'`  
  Output path for the generated sitemap.
- `maxEntriesPerFile: 50000`  
  Splits into multiple sitemap files if needed.
- `stripQuerystring: true`  
  Removes query strings from URLs.
- `ignoreAMP: true`  
  Skips AMP URLs.
- `lastMod: true`  
  Includes `lastmod` timestamps if available.
- `priorityMap: [1.0, 0.5, 0.2, 0]`  
  Priority by depth (from root to deeper pages).
- `ignore: url => /<pattern>/g.test(url)`  
  Skip any URLs matching the provided pattern (replace `<pattern>` with your own).

Event listeners:

- `done` logs when the crawl finishes.
- `add` logs each URL added to the sitemap.
- `error` logs crawl errors.
- `ignore` logs URLs skipped due to robots.txt or ignore rules.

## Setup

```bash
npm install
```

## Run

```bash
node crawler.js
```

Notes:

- `npm test` currently points to a non-existent `crawl` script, so it will fail.
- The sitemap will be written to `./sitemap.xml` (overwritten each run).

## Customize

- Change `baseUrl` in `crawler.js` to crawl a different site.
- Update the `ignore` regex to exclude URLs you do not want in the sitemap.
- Increase `maxDepth` to crawl deeper links.
