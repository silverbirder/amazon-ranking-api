'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const host = 'https://www.amazon.co.jp';
let amazonCategoryUrl = []

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
        const attrPlusHost = attr.startsWith(host) ? attr : `${host}${attr}`;
        // a.jp/b/0000/c-d/f -> a.jp/b/000/
        return attrPlusHost.replace(/\d+\//, '')
    })
}

async function start(url, selector, counter) {
    if (counter == 0) {
        url = `${host}/ranking?type=top-sellers`
        selector = '#crown-category-nav > a'
    }
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