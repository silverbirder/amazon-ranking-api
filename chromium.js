const chrome = require('chrome-aws-lambda');
// const puppeteer = require('puppeteer-core');
const puppeteer = require('puppeteer');

async function initBrowser() {
    // const browser = await puppeteer.launch({
    //     args: chrome.args,
    //     executablePath: await chrome.executablePath,
    //     headless: chrome.headless,
    // });
    const browser = await puppeteer.launch({args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--lang=ja,en-US;q=0.9,en;q=0.8',
            '--user-agent=MMozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
        ],
        handleSIGINT : false
    });
    return browser
}
async function closeBrowser(browser) {
    await browser.close();
}
async function getScreenshot(browser, url, selector) {
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
    const data = await page.$$eval(selector, list => {
        return list.map(data => data.getAttribute('href'));
    });
    return data;
}

module.exports = { closeBrowser, initBrowser, getScreenshot };