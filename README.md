# Sitemap Playground

A lightweight Node.js crawler that walks your site and generates a `sitemap.xml` — no external sitemap libraries required. Designed to be readable, hackable, and easy to reuse for one-off sitemap generation.

---

## Getting Started

**1. Install dependencies:**

```bash
npm install
```

**2. Update `config.json`** with your site's URL and desired settings (see [Configuration](#configuration) below).

**3. Run the crawler:**

```bash
npm run crawl
```

The sitemap is written to `./sitemap.xml` by default and overwritten on each run.

> **Tip:** Pass a custom config path with `npm run crawl -- path/to/config.json`

---

## Configuration

All settings live in `config.json`.

### Core Settings

| Field              | Description                                                        | Default            |
| ------------------ | ------------------------------------------------------------------ | ------------------ |
| `baseUrl`          | Starting URL and origin boundary for the crawl.                    | —                  |
| `maxDepth`         | How many levels deep to follow links. `0` = start URL only.       | —                  |
| `filepath`         | Output path for the sitemap or sitemap index.                      | `./sitemap.xml`    |
| `maxEntriesPerFile`| Max entries per sitemap file before splitting into an index.       | —                  |

### URL Filtering

| Field              | Description                                                        | Default            |
| ------------------ | ------------------------------------------------------------------ | ------------------ |
| `stripQuerystring` | Remove `?query=...` from URLs before de-duplication.               | `false`            |
| `ignoreAMP`        | Skip URLs that look like AMP variants.                             | `false`            |
| `ignorePattern`    | Regex pattern string to block matching URLs.                       | —                  |
| `ignoreFlags`      | Regex flags for `ignorePattern` (e.g. `"i"` for case-insensitive).| —                  |

> **Example:** To skip all `/private/` URLs, set `ignorePattern` to `"\\/private\\/"` and `ignoreFlags` to `"i"`.

### Sitemap Output

| Field              | Description                                                        | Default            |
| ------------------ | ------------------------------------------------------------------ | ------------------ |
| `lastMod`          | Add `<lastmod>` tags using the `Last-Modified` response header.    | `false`            |
| `priorityMap`      | Array assigning priority by depth (values clamped by array length).| —                  |

### JS Rendering (Optional)

Enable these if your site relies on client-side rendering or hides links behind JavaScript-driven UI.

| Field                    | Description                                                    | Default          |
| ------------------------ | -------------------------------------------------------------- | ---------------- |
| `renderWithJs`           | Enable headless browser rendering via Playwright.              | `false`          |
| `renderWaitUntil`        | Playwright load state to wait for.                             | `"networkidle"`  |
| `renderTimeoutMs`        | Playwright navigation timeout in milliseconds.                 | `30000`          |
| `renderExpandAllDetails` | Force all `<details>` elements open after render.              | `false`          |
| `renderExpandAria`       | Click elements with `aria-expanded="false"` after render.      | `false`          |
| `renderExpandSelectors`  | List of CSS selectors to click for expansion.                  | `[]`             |
| `renderExpandWaitMs`     | Time (ms) to wait after expansion for the DOM to settle.       | —                |

To use JS rendering, install Playwright separately:

```bash
npm install playwright
```

### Advanced

| Field         | Description                                              | Default                |
| ------------- | -------------------------------------------------------- | ---------------------- |
| `httpsAgent`  | Passed to Node's HTTP client.                            | `https.globalAgent`    |

---

## Events

The crawler is an `EventEmitter`. Listen to these events for custom integrations:

| Event    | Emitted when…                                |
| -------- | -------------------------------------------- |
| `add`    | A URL is added to the sitemap.               |
| `ignore` | A URL is skipped by your ignore rules.       |
| `error`  | An HTTP or parsing failure occurs.           |
| `done`   | The crawl finishes.                          |

---

## How It Works

- **Breadth-first, single-origin crawl** — only follows links within the `baseUrl` origin.
- **Regex-based HTML parsing** — keeps dependencies minimal (best-effort extraction).
- **Redirects** are followed up to 5 hops.
- **Asset URLs** (CSS, JS, images, fonts, media, and `/_next/`) are automatically filtered out.
- **Non-HTML responses** are never written to the sitemap.
- **`<lastmod>`** is only written when the server returns a valid `Last-Modified` header.

---

## Project Layout

```text
config.json        Crawl configuration
crawler.js         Entry point — loads config and starts the crawl
lib/
  crawler.js       Core crawler logic and event flow
  http.js          Page fetching and redirect handling
  sitemap.js       Sitemap XML and index writing
  utils.js         HTML link extraction and helpers
test/
  README.md        Testing infrastructure details
```

---

## Testing

Run the test suite (uses Node.js built-in test runner):

```bash
npm test
```

Tests cover URL normalization, HTML link extraction, sitemap XML generation, HTTP handling, and crawler configuration. See `test/README.md` for details.

---

## Common Customizations

| What you want to do                        | What to change                                            |
| ------------------------------------------ | --------------------------------------------------------- |
| Crawl a different site                     | Update `baseUrl`                                          |
| Limit crawl depth                          | Set `maxDepth`                                            |
| Exclude specific paths (e.g. admin, pagination) | Add an `ignorePattern` with optional `ignoreFlags`   |
| Split large sitemaps into smaller files    | Adjust `maxEntriesPerFile`                                |
| Handle a JS-rendered site                  | Set `renderWithJs` to `true` and install Playwright       |
