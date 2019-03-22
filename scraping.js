'use strict';

// const axios = require('axios');
// const cheerio = require('cheerio');
const { closeBrowser, initBrowser, getScreenshot, evalFlatListFunc, evalDeepListFunc } = require('./chromium');
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

function splitArray(ary, size) {
    let resultArray = [];
    for (let i=0; i< Math.ceil(ary.length/size); i++) {
        const start = i*size;
        const end = start + size;
        resultArray.push(ary.slice(start, end))
    }
    return resultArray;
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
    // if (counter == 0) {
    //     urls = [`${host}/ranking?type=top-sellers`]
    //     selector = '#crown-category-nav > a'
    // }
    // amazonCategoryUrl.concat(urls)
    const browser = await initBrowser();
    // let topAmazonCategoryUrl = await Promise.all(
    //     urls.map(url => getScreenshot(browser, url, selector, evalFlatListFunc)
    // ))
    // topAmazonCategoryUrl = topAmazonCategoryUrl[0].map(attr => {
    //     return attr.startsWith(host) ? attr : `${host}${attr}`
    // })
    // amazonCategoryUrl.concat(topAmazonCategoryUrl)
    // const splitData = splitArray(topAmazonCategoryUrl, 3)
    const splitData = [["https://www.amazon.co.jp/gp/bestsellers/books/466294/ref=zg_bs_nav_b_1_b", "https://www.amazon.co.jp/gp/bestsellers/books/10667101/ref=zg_bs_nav_b_1_b"]]
    for (let i=0; i<splitData.length; i++) {
        const categoryUrl = await Promise.all(
            splitData[i].map(url => getScreenshot(browser, url, '#zg_browseRoot', evalDeepListFunc)
        ))
        console.log(categoryUrl)
        amazonCategoryUrl.concat(categoryUrl)
        break
    }
    await closeBrowser(browser)
}

start(null, null, 0)
