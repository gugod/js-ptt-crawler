"use strict";

const fs = require('fs'),
      walkdir = require('walkdir'),
      cheerio = require('cheerio');

function convert_html_to_json(input_html) {
    var $ = cheerio.load(input_html);

    var doc = {"body": "", "meta": [], "push": []};

    $(".article-metaline").each(function(i, el) {
        doc["meta"].push([
            $(el).find(".article-meta-tag").text(),
            $(el).find(".article-meta-value").text()
        ]);
        $(el).remove();
    });

    $("div.push").each(function(i, el) {
        doc["push"].push({
            "tag": $(el).find(".push-tag").text(),
            "userid": $(el).find(".push-userid").text(),
            "content": $(el).find(".push-content").text(),
            "ipdatetime": $(el).find(".push-ipdatetime").text()
        });
        $(el).remove();
    });

    doc["body"] = $("#main-content").text();

    return doc;
}

function process_one(input_file, output_file) {
    var html = fs.readFileSync(input_file);
    var doc  = convert_html_to_json(html);
    fs.writeFileSync(output_file, JSON.stringify(doc));
    console.log("==>", output_file);
}

if ( process.argv.length != 3) {
    process.abort();
}
var input_dir = process.argv[2];

walkdir.sync(input_dir, function(path, stat) {
    if (! stat.isFile()) return;
    var output_path = path.replace(/.html$/, '.json');
    process_one(path, output_path);
});
