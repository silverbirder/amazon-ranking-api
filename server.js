const http = require('http');
const { getScreenshot } = require('./chromium');


// HTTPサーバーのイベントハンドラを定義
http.createServer(function (req, res) {
    test(req,res)
}).listen(4000, '0.0.0.0');

const test = async function(req, res) {
    const file = await getScreenshot('https://www.amazon.co.jp/ranking?type=top-sellers', '#crown-category-nav > a');
    console.log(file);
    res.statusCode = 200;
    res.end(file.join(','))
}

// process.on('unhandledRejection', console.dir);