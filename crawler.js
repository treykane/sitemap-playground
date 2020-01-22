// Using -- https://github.com/lgraubner/sitemap-generator
const SitemapGenerator = require('sitemap-generator');

const baseUrl = 'https://redbookjars.com'
// create the sitemap generator
const generator = SitemapGenerator(baseUrl, {
    httpsAgent: https.globalAgent,
    maxDepth: 0,
    filepath: './sitemap.xml',
    maxEntriesPerFile: 50000,
    stripQuerystring: true,
    ignoreAMP: true,
    lastMod: true,
    priorityMap: [1.0, 0.5, 0.2, 0],
    ignore: url => {
        // Prevent URLs from being added that contain `<pattern>`.
        // https://stackoverflow.com/questions/30931079/validating-a-url-in-node-js/55585593
        return /<pattern>/g.test(url)
    }
});


// register event listeners
generator.on('done', () => {
    // sitemaps created
    console.log('SITEMAP CRAWL COMPLETE!')
  });

  generator.on('add', (url) => {
    // log url
    console.log('Mapped: ', url)
  });

generator.on('error', (error) => {
    // => { code: 404, message: 'Not found.', url: 'http://example.com/foo' }
    console.log(error);
});

generator.on('ignore', (url) => {
    // log ignored url
    console.log('Robots told me to ignore: ', url)
  });

  // start the crawler
  generator.start();