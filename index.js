var fs = require('fs')
var path = require('path')
var request = require('request')
var url = require('url')
var encoding = require('encoding')
var session = process.env.ebookSpiderSession

var numder = 1
load(1, [])
console.log('starting...')

function load(n, books) {
  var options = {
    url: 'http://readfree.me/edition/' + n + '/down',
    headers: {
      'content-type': 'charset=UTF-8',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-TW;q=0.2,ja;q=0.2,fr;q=0.2',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.104 Safari/537.36',
      'Cookie': 'sessionid=' + session + '; csrftoken=oY6TV9xwgY2C9XoYx7sMneCaPcUIdA3S'
    }
  };

  var r = request(options).on('response', function(res) {
    var filename,
      contentDisp = res.headers['content-disposition'];
    if (contentDisp && /^attachment/i.test(contentDisp)) {
      filename = contentDisp.toLowerCase()
        .split('filename=')[1]
        .split(';')[0]
        .replace(/"/g, '');
      filename = encoding.convert(filename, "Latin_1")
      filename = filename.toString()
    } else {
      numder++
      return load(numder, books)
    }
    console.log('Downloading No.' + n + ' ' + filename + ' ...');
    if (filename) {
      var writeStream = r.pipe(fs.createWriteStream(path.join(__dirname + '/books', filename)));
      writeStream.on('finish', function() {
        numder++
        if (numder < 38964) {
          books[books.length] = {
            book_id: n,
            filename: filename
          }
          return load(numder, books)
        } else {
          var json = JSON.stringify(books)
          fs.writeFile('book.json', json, 'utf-8', function(err, result) {
            process.exit()
          })
        }


      });

      writeStream.on('error', function(err) {
        console.error(err);
      });
    }
  });
}
