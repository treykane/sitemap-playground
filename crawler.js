const https = require('https');
const { SimpleSitemapCrawler } = require('./lib/crawler');

const baseUrl = 'https://treykane.com';

const options = {
  httpsAgent: https.globalAgent,
  maxDepth: 0,
  filepath: './sitemap.xml',
  maxEntriesPerFile: 50000,
  stripQuerystring: true,
  ignoreAMP: true,
  lastMod: true,
  priorityMap: [1.0, 0.5, 0.2, 0],
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
