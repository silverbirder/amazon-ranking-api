'use strict';

// const axios = require('axios');
// const cheerio = require('cheerio');
const { closeBrowser, initBrowser, getScreenshot } = require('./chromium');
const host = 'https://www.amazon.co.jp';
let amazonCategoryUrl = [];


// best sellers
// https://www.amazon.co.jp/gp/bestsellers/instant-video/2757453051/ref=zg_bs_nav_aiv_1_aiv
// ↓
// https://www.amazon.co.jp/gp/bestsellers/instant-video/2757453051/

// new-release
// https://www.amazon.co.jp/gp/new-releases/mobile-apps/ref=crw_ratp_nr_mobile-apps
// ↓
// https://www.amazon.co.jp/gp/new-releases/mobile-apps/

// trends
// https://www.amazon.co.jp/trends/instant-video?ref=crw_trndtp_trk_instant-video
// ↓
// https://www.amazon.co.jp/trends/instant-video/
const matchAmazonCategoryUrlByGp = new RegExp('^https\:\/\/www\.amazon\.co\.jp\/gp\/([^/]+\/){2,3}');
const matchAmazonCategoryUrlByTrends = new RegExp('^https\:\/\/www\.amazon\.co\.jp\/treands\/[^/]+\/?');

function getContentAttrByList(html, selector, attr) {
    const $ = cheerio.load(html);
    const content = $(`${selector}`).map((i, el) => {
        return $(el).attr(attr)
    }).get();
    return content;
}

async function featchCategories(url, selector) {
    const response = await axios(url);
    // add host and delete not need parameter
    return getContentAttrByList(response.data, selector, 'href').map(attr => {
        const url = attr.startsWith(host) ? attr : `${host}${attr}`;
        const matchGp = url.match(matchAmazonCategoryUrlByGp)
        if (matchGp != null) {
            return matchGp[0]
        }
        const matchTrends = url.match(matchAmazonCategoryUrlByTrends)
        if (matchTrends != null) {
            return matchTrends[0]
        }
        return url
    })
}

async function start(urls, selector, counter) {
    if (counter == 0) {
        urls = [`${host}/ranking?type=top-sellers`]
        selector = '#crown-category-nav > a'
    }
    // check end point
    // For example, highlight(.zg_selected) category's layer equals most deep category's layer
    // ... not code

    const browser = await initBrowser()
    let data = await Promise.all(
        urls.map(url => getScreenshot(browser, url, selector)
    ))
    data = data[0].map(attr => {
        return attr.startsWith(host) ? attr : `${host}${attr}`
    })
    data = data.slice(0,2)
    console.log(data)
    const data2 = await Promise.all(
        data.map(url => getScreenshot(browser, url, '#zg_browseRoot > ul  ul  li  a')
    ))
    console.log(data2)
    await closeBrowser(browser)
}

start(null, null, 0)