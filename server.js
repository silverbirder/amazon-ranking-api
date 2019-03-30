const http = require('http');
const amazonRankingApi = require('./amazonRankingApi')


// HTTPサーバーのイベントハンドラを定義
http.createServer(function (req, res) {
    amazonRankingApi(req,res)
}).listen(4000, '0.0.0.0');

// process.on('unhandledRejection', console.dir);