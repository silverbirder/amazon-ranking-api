const axios = require('axios');
const cheerio = require('cheerio');
const host = 'https://www.amazon.co.jp'

function getContent(html, selector) {
    const $ = cheerio.load(html);
    const content = $(`${selector}`).map((i, el) => {
        return $(el).attr('href')
    }).get();
    return content;
}

let urlList = []
axios(`${host}/ranking?type=new-releases`).then(response => {
    const content = getContent(response.data, '#crown-category-nav a');
    urlList = urlList.concat(content)
    content.forEach(path => {
        axios(`${host}${path}`).then(response2 => {
            const content2 = getContent(response2.data, '#zg_browseRoot ul ul li a')
            urlList = urlList.concat(content2)
            console.log(urlList)
        });
    })
})