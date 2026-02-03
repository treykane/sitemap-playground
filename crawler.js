const fs = require('fs');
const path = require('path');
const https = require('https');
const { SimpleSitemapCrawler } = require('./lib/crawler');

/**
 * Entry point configuration for the crawler.
 * Update `config.json` to target a different site or crawl depth.
 */
const configPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'config.json');
const rawConfig = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(rawConfig);

const baseUrl = config.baseUrl;
const options = { ...(config.options || {}) };

if (options.httpsAgent === true || options.httpsAgent === 'global') {
  options.httpsAgent = https.globalAgent;
} else if (!options.httpsAgent) {
  delete options.httpsAgent;
}

const ignorePattern = options.ignorePattern;
const ignoreFlags = options.ignoreFlags || '';
if (ignorePattern) {
  const ignoreRegex = new RegExp(ignorePattern, ignoreFlags);
  options.ignore = (url) => ignoreRegex.test(url);
}
delete options.ignorePattern;
delete options.ignoreFlags;

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
