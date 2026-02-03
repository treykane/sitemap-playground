const https = require('https');
const { SimpleSitemapCrawler } = require('./lib/crawler');

/**
 * Entry point configuration for the crawler.
 * Update `baseUrl` and `options` to target a different site or crawl depth.
 */
const baseUrl = 'https://treykane.com';

const options = {
  httpsAgent: https.globalAgent,
  maxDepth: 2,
  filepath: './sitemap.xml',
  maxEntriesPerFile: 50000,
  stripQuerystring: true,
  ignoreAMP: true,
  lastMod: true,
  renderWithJs: true,
  renderWaitUntil: 'networkidle',
  renderTimeoutMs: 30000,
  renderExpandAllDetails: true,
  renderExpandAria: true,
  renderExpandSelectors: [],
  renderExpandWaitMs: 300,
  priorityMap: [1.0, 0.5, 0.2, 0],
  // Replace the regex with a real pattern to exclude URLs (e.g. /\/private\//i).
  ignore: (url) => {
    return /<pattern>/g.test(url);
  }
};

const crawler = new SimpleSitemapCrawler(baseUrl, options);

crawler.on('done', () => {
  console.log('SITEMAP CRAWL COMPLETE!');
});

crawler.on('add', (url) => {
  console.log('Mapped: ', url);
});

crawler.on('error', (error) => {
  console.log(error);
});

crawler.on('ignore', (url) => {
  console.log('Robots told me to ignore: ', url);
});

crawler.start();
