const output = require('./output')()
const { closeBrowser, initBrowser, getAmazonCategoryUrl, evalGetTopFunc } = require('./chromium');

module.exports = async function (req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if ( req.method === 'OPTIONS' ) {
        res.writeHead(200);
        res.end();
        return;
    }

    const max = output.length - 1
    const random = Math.floor(Math.random() * (max + 1))
    const amazonCategoryUrl = output[random]
    const browser = await initBrowser()
    try {
        const selector = ''
        let data = await getAmazonCategoryUrl(browser, amazonCategoryUrl, selector, evalGetTopFunc)
        await closeBrowser(browser)
        data['url'] = amazonCategoryUrl
        res.statusCode = 200
        res.setHeader('Content-Type', `application/json`)
        res.end(JSON.stringify({
            'message': 'ok',
            'data': data
        }))
    } catch (e) {
        console.log(e)
        await closeBrowser(browser)
        res.statusCode = 500
        res.setHeader('Content-Type', `application/json`)
        res.end(JSON.stringify({
            'message': e,
            'data': {
                'url': amazonCategoryUrl,
                'category': '',
                'items': [],
            },
        }))
    }
}