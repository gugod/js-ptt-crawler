var https = require('https'),
    cheerio = require('cheerio');

var ptt_url = "https://www.ptt.cc";

function ptt_get(url, cb) {
    var req = https.get(url, function(res) {
        var out = "";
        res.on('data', function(chunk) {
            out = out + chunk;
        });
        res.on('end', function() {
            cb(out);
        })
    });
    req.end();
}

function harvest_board_indices(board_url, board_name, cb) {
    ptt_get(
        board_url,
        function(body) {
            var $ = cheerio.load(body);
            var ret = [];
            $("a[href^='/bbs/" + board_name + "/index']").each(function(i, el) {
                var href = $(el).attr("href");
                var m;
                if (m = href.match(/index([0-9]+)\.html/)) {
                    ret.push({
                        page_number: m[1],
                        url: ptt_url + href
                    });
                }
            });
            cb(ret);
        }
    )
}

function harvest_articles(board_index_url, board_name, cb) {
   ptt_get(
        board_index_url,
        function(body) {
            var $ = cheerio.load(body);
            var ret = [];
            $("a[href^='/bbs/" + board_name + "/']").each(function(i, el) {
                var href = $(el).attr("href");
                var m;
                if (m = href.match(/(M.+)\.html/)) {
                    ret.push({
                        id: m[1],
                        url: ptt_url + href
                    });
                }
            });
            cb(ret);
        }
    )
}

if ( process.argv.length != 4) {
    process.abort();
}

var board_name = process.argv[2];
var output_dir = process.argv[3];

harvest_board_indices(
    ptt_url + "/bbs/" + board_name + "/index.html",
    board_name,
    function(board_indices) {
        for (var i = 0; i < board_indices.length; i++) {
            harvest_articles(
                board_indices[i]["url"],
                board_name,
                function(articles) {
                    console.log(articles);
                }
            );
        }
    }
);
