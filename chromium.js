const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
// const puppeteer = require('puppeteer');

async function initBrowser() {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });
    // const browser = await puppeteer.launch({args: [
    //         '--no-sandbox',
    //         '--disable-setuid-sandbox',
    //         '--lang=ja,en-US;q=0.9,en;q=0.8',
    //         '--user-agent=MMozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
    //     ],
    //     handleSIGINT : false
    // });
    return browser
}
async function closeBrowser(browser) {
    await browser.close();
}
async function getAmazonCategoryUrl(browser, url, selector, evalFunc) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg'))
            interceptedRequest.abort();
        else
            interceptedRequest.continue();
    });
    page.setDefaultNavigationTimeout(30000);
    const response = await page.goto(url);
    await page.waitFor(1000);// 1秒待つ
    if (response.status() !== 200) {
        return [];
    }
    const result = await evalFunc(page, selector)
    console.log(`process...done:${url}`)
    await page.close()
    return result
}
async function evalFlatListFunc(page, selector) {
    return await page.$$eval(selector, list => {
        return list.map(data => data.getAttribute('href'));
    });
}

async function evalDeepListFunc(page, selector) {
    // for adult only page ...
    if (await page.$('body > center > span.alert') != null) {
        await page.click('body > center > div:nth-child(6) > a')
        await page.waitForSelector(selector);
    }

    let deepUlSelector = `${selector} > ul`
    // find deep category
    while(true) {
        if (await page.$(`${deepUlSelector} > ul`) === null) {
            break;
        }
        deepUlSelector += ' > ul'
    }
    // get anchor href
    return await page.$$eval(`${deepUlSelector} > li > a`, list => {
        return list.map(data => data.getAttribute('href'));
    })
}

async function evalGetTopFunc(page, selector) {
    // for adult only page ...
    if (await page.$('body > center > span.alert') != null) {
        await page.click('body > center > div:nth-child(6) > a')
        await page.waitForSelector(selector);
    }
    const category = await page.$eval('#zg_listTitle .category', item => {
        return item.textContent;
    });
    let result = []
    const items = await page.$$('#zg_critical .zg_itemRow')
    for (let i=0; i<items.length; i++) {
        const src = await items[i].$eval('img.a-dynamic-image', img => {
            return img.getAttribute('src')
        })
        const crown = await items[i].$eval('.zg_crown img', span => {
            return span.getAttribute('src')
        })
        const title = await items[i].$eval('.p13n-sc-truncated', div => {
            return div.textContent
        })
        const link = await items[i].$eval('div>div>div:first-child>a', a => {
            return  'https://www.amazon.co.jp' + a.getAttribute('href')
        })
        result.push({
            src: src,
            crown: crown,
            title: title,
            link: link
        })
    }
    return {
        category: category,
        items: result
    }
}

module.exports = { closeBrowser, initBrowser, getAmazonCategoryUrl, evalFlatListFunc, evalDeepListFunc, evalGetTopFunc };