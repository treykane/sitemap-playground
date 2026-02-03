# Sitemap Playground

Sitemap Playground is a small Node.js crawler that walks a site and writes a `sitemap.xml` without relying on external sitemap libraries. It is intended to be easy to read, hack on, and reuse for one-off sitemap generation.

## Quick Start

Install dependencies:

```bash
npm install
```

Run the crawler:

```bash
npm run crawl
```

By default the sitemap is written to `./sitemap.xml` and overwritten on each run.

## Configuration

All configuration lives in `crawler.js`. The important fields are:

- `baseUrl` is the starting point and origin boundary for the crawl.
- `httpsAgent` is passed to Node’s HTTP client (defaults to `https.globalAgent`).
- `maxDepth` controls how far to follow links. `0` means only the start URL.
- `filepath` is the output path for the sitemap or sitemap index.
- `maxEntriesPerFile` splits large sitemaps into multiple files and writes an index.
- `stripQuerystring` removes `?query=...` from URLs before de-duplication.
- `ignoreAMP` skips URLs that look like AMP variants.
- `lastMod` adds a `lastmod` tag based on the `Last-Modified` header.
- `renderWithJs` enables optional JS rendering via Playwright (see below).
- `renderWaitUntil` controls Playwright’s load state (`networkidle` by default).
- `renderTimeoutMs` sets Playwright’s navigation timeout (default: 30000).
- `renderExpandAllDetails` forces all `<details>` elements open after render.
- `renderExpandAria` clicks elements with `aria-expanded="false"` after render.
- `renderExpandSelectors` is a list of CSS selectors to click for expansion.
- `renderExpandWaitMs` waits after expansion to allow the DOM to settle.
- `priorityMap` assigns priority by depth; values are clamped by the array length.
- `ignore` lets you block URLs with a custom predicate (replace the regex placeholder).

## Events

The crawler is an `EventEmitter`. You can listen to:

- `done` when the crawl finishes.
- `add` for every URL added to the sitemap.
- `ignore` for URLs skipped by robots or your ignore predicate.
- `error` for HTTP or parsing failures.

## Behavior Notes

- Crawling is breadth-first and single-origin only.
- `robots.txt` support is limited to `User-agent: *` `Disallow:` rules.
- HTML parsing uses a regex to keep dependencies light; it is best-effort.
- Redirects are followed up to 5 hops.
- Asset URLs (CSS/JS/images/fonts/media and `/_next/`) are filtered out up front.
- Non-HTML responses are never written to the sitemap.
- `lastmod` is only written when a valid `Last-Modified` header exists.

## Optional JS Rendering

If your site relies on client-side rendering or hides links behind JavaScript-driven UI, enable JS rendering and install Playwright:

```bash
npm install playwright
```

Then set `renderWithJs: true` in `crawler.js`. When enabled, pages are rendered in a headless browser, expansion hooks can open common UI sections, and the final DOM is used for link extraction.

## Project Layout

- `crawler.js` configures and starts the crawl.
- `lib/crawler.js` contains the crawler logic and event flow.
- `lib/http.js` fetches pages and follows redirects.
- `lib/robots.js` parses `robots.txt` disallow rules.
- `lib/sitemap.js` writes sitemap XML and indexes.
- `lib/utils.js` provides HTML link extraction and helpers.

## Customize

Common tweaks:

- Change `baseUrl` to crawl a different site.
- Set `maxDepth` to control the crawl scope.
- Update `ignore` to exclude paths like admin pages or pagination.
- Adjust `maxEntriesPerFile` if you want smaller sitemap chunks.

## Development Notes

- `npm test` runs the crawler via the `crawl` script.
- The project intentionally avoids external dependencies to stay hackable.
