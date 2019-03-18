'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
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

async function start(url, selector, counter) {
    if (counter == 0) {
        url = `${host}/ranking?type=top-sellers`
        selector = '#crown-category-nav > a'
    }
    // check end point
    // For example, highlight(.zg_selected) category's layer equals most deep category's layer
    // ... not code

    const categories = await featchCategories(url, selector)
    amazonCategoryUrl = amazonCategoryUrl.concat(categories)
    if (counter >= 1) {
        console.log(amazonCategoryUrl)
        console.log('end loop')
        // oh.. can't access page to need one step
        return;
    }
    categories.forEach(url => {
        counter++;
        start(url, '#zg_browseRoot > ul > ul > li > a', counter)
    })
}

start(null, null, 0)