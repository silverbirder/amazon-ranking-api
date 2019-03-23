'use strict';

const fs = require('fs')
const { closeBrowser, initBrowser, getScreenshot, evalFlatListFunc, evalDeepListFunc } = require('./chromium');
const host = 'https://www.amazon.co.jp';
const matchAmazonCategoryUrlByGp = new RegExp('^https\:\/\/www\.amazon\.co\.jp\/gp\/([^/]+\/){2,3}');
const matchAmazonCategoryUrlByTrends = new RegExp('^https\:\/\/www\.amazon\.co\.jp\/treands\/[^/]+\/?');
let amazonCategoryUrl = [];

function splitArray(arr, size) {
    let resultArray = []
    for (let i=0; i< Math.ceil(arr.length/size); i++) {
        const start = i*size
        const end = start + size
        resultArray.push(arr.slice(start, end))
    }
    return resultArray
}

function normalizeAmazonCategoryUrl(urls) {
    return urls.map(url => {
        url = url.startsWith(host) ? url : `${host}${url}`
        const matchGp = url.match(matchAmazonCategoryUrlByGp)
        if (matchGp != null) {
            return matchGp[0]
        }
        const matchTrends = url.match(matchAmazonCategoryUrlByTrends)
        if (matchTrends != null) {
            return matchTrends[0]
        }
    })
}

function diffArray(arr1, arr2) {
    return arr1.concat(arr2)
        .filter(item => !arr1.includes(item))
}

function reduceArray(arr1) {
    return arr1.reduce((pre,current) => {pre.push(...current);return pre},[])
}

function removeDuplication(arr1) {
    return Array.from(new Set(arr1))
}

async function searchCategory(browser, urls, obj) {
    let categories = []
    const sUrls = splitArray(urls, 4)
    for (let i=0; i<sUrls.length; i++) {
        const category = await Promise.all(
            sUrls[i].map(url => getScreenshot(browser, url, obj.selector, obj.action)
            )
        )
        categories.push(reduceArray(category))
    }
    // 2 dimension to 1 dimension
    categories = reduceArray(categories)
    // normalize url
    categories = normalizeAmazonCategoryUrl(categories)
    // remove duplication
    categories = removeDuplication(categories)
    return diffArray(amazonCategoryUrl, categories)
}

async function start(entryUrl, firstSelector, otherSelector, firstAction, otherAction) {
    const browser = await initBrowser();
    const firstObj = {
        'selector': firstSelector,
        'action': firstAction,
    }
    const otherObj = {
        'selector': otherSelector,
        'action': otherAction,
    }
    let category = await searchCategory(browser, [entryUrl], firstObj)
    amazonCategoryUrl = amazonCategoryUrl.concat(category)
    while (true) {
        category = await searchCategory(browser, category, otherObj)
        if (category.length === 0) break;
        amazonCategoryUrl = amazonCategoryUrl.concat(category)
    }
    await closeBrowser(browser)
}

const entryUrl = `${host}/ranking?type=top-sellers`,
    firstSelector = '#crown-category-nav > a',
    otherSelector = '#zg_browseRoot',
    firstAction = evalFlatListFunc,
    otherAction = evalDeepListFunc
start(entryUrl, firstSelector, otherSelector, firstAction, otherAction).then(() => {
    fs.writeFileSync("output.txt", amazonCategoryUrl.join('\n'));
}).catch((error) => {
    console.error(error)
})
