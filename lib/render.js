let playwrightModule;
let browserPromise;

function loadPlaywright() {
  if (playwrightModule) return playwrightModule;
  try {
    // Lazy load so the dependency is only required when JS rendering is enabled.
    // eslint-disable-next-line global-require
    playwrightModule = require('playwright');
    return playwrightModule;
  } catch (error) {
    const message = [
      'Playwright is not installed.',
      'Install it with `npm install playwright` to enable JS rendering.'
    ].join(' ');
    const err = new Error(message);
    err.cause = error;
    throw err;
  }
}

async function getBrowser() {
  if (!browserPromise) {
    const { chromium } = loadPlaywright();
    browserPromise = chromium.launch({ headless: true });
  }
  return browserPromise;
}

/**
 * Render a page with JavaScript enabled and return the final HTML.
 * @param {string} targetUrl
 * @param {object} options
 * @param {string} [options.waitUntil]
 * @param {number} [options.timeoutMs]
 * @param {string} [options.userAgent]
 */
async function renderUrl(targetUrl, options = {}) {
  const browser = await getBrowser();
  const page = await browser.newPage({
    userAgent: options.userAgent
  });

  try {
    const response = await page.goto(targetUrl, {
      waitUntil: options.waitUntil || 'networkidle',
      timeout: options.timeoutMs || 30000
    });

    if (options.expandAllDetails || options.expandAria || (Array.isArray(options.expandSelectors) && options.expandSelectors.length)) {
      await page.evaluate((expandOptions) => {
        const { expandAllDetails, expandAria, expandSelectors } = expandOptions;

        if (expandAllDetails) {
          document.querySelectorAll('details:not([open])').forEach((node) => {
            node.setAttribute('open', '');
          });
        }

        if (expandAria) {
          document.querySelectorAll('[aria-expanded="false"]').forEach((node) => {
            try {
              if (typeof node.click === 'function') {
                node.click();
              } else {
                node.setAttribute('aria-expanded', 'true');
              }
            } catch (error) {
              node.setAttribute('aria-expanded', 'true');
            }
          });
        }

        if (Array.isArray(expandSelectors)) {
          expandSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((node) => {
              try {
                if (typeof node.click === 'function') {
                  node.click();
                }
              } catch (error) {
                // Ignore click failures for best-effort expansion.
              }
            });
          });
        }
      }, {
        expandAllDetails: options.expandAllDetails,
        expandAria: options.expandAria,
        expandSelectors: options.expandSelectors
      });
    }

    if (options.expandWaitMs) {
      await page.waitForTimeout(options.expandWaitMs);
    }

    const statusCode = response ? response.status() : 0;
    const statusMessage = response ? response.statusText() : '';
    const headers = response ? response.headers() : {};
    const body = await page.content();

    return {
      statusCode,
      statusMessage,
      headers,
      body
    };
  } finally {
    await page.close();
  }
}

async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  await browser.close();
  browserPromise = null;
}

module.exports = {
  renderUrl,
  closeBrowser
};
