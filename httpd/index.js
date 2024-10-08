const http = require('http');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const formidable = require('formidable');

const hostname = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 9098;
const root = path.join(__dirname, 'www');

http.createServer(function (request, response) {

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.url == '/api/v3/common/upload' && request.method == 'POST') {
    let form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      let now = moment().format('YYYYMMDD');
      let filepath = './dl/' + now + '/';
      if (!fs.existsSync(filepath))
        fs.mkdirSync(filepath);

      now = moment().format('YYYYMMDDhhmmss');
      filepath += now;
      let tempFilePath = files.file[0].filepath;
      filepath += path.extname(files.file[0].originalFilename);

      fs.copyFile(tempFilePath, filepath, fs.constants.COPYFILE_EXCL, err => {
        if (err) throw err;
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ webpath: filepath.substring(1) }, null, 2));
      });

    });
    return;
  }

  if (request.url == '/api/v3/common/script/stdbiz/cm/article/find' && request.method == 'POST') {
    let article = {
      articleId: 1,
      content: `
        <h2>习言道｜该改的、能改的我们坚决改</h2>
        <p>2024-07-17 08:58:37 中国新闻网 </p>
        <p>　　改革开放是决定当代中国命运的关键一招，也是决定中国式现代化成败的关键一招。习近平总书记围绕全面深化改革作出一系列重要论述，强调要把全面深化改革作为推进中国式现代化的根本动力。</p>
        <p><img style="border:0px solid #000000" src="http://i2.chinanews.com.cn/simg/cmshd/2024/07/17/aab6eef3b551433e9528dccb7a1fb5ef.jpg" alt=""></p>
        <p><img style="border:0px solid #000000" src="http://i2.chinanews.com.cn/simg/cmshd/2024/07/17/c012ba385ed44772a6bf34cd4b380cde.jpg" alt=""></p>
        <p><img style="border:0px solid #000000" src="http://i2.chinanews.com.cn/simg/cmshd/2024/07/17/69435fcbbf8d40169cadb83f5c0c59c1.jpg" alt=""></p>
        <p><img style="border:0px solid #000000" src="http://i2.chinanews.com.cn/simg/cmshd/2024/07/17/a244b5a9273c458cae28bcc45ae4d92b.jpg" alt=""></p>
        <p><img style="border:0px solid #000000" src="http://i2.chinanews.com.cn/simg/cmshd/2024/07/17/02844292f6484ebfa52c792db779a3ab.jpg" alt=""></p>
        <p><img style="border:0px solid #000000" src="http://i2.chinanews.com.cn/simg/cmshd/2024/07/17/1274c02e8e8c423daa306d58589d0b78.jpg" alt=""></p>
        <p class="wdtop" style="text-align:right;margin-right:0px;font-size:18px;color:#808080;">责任编辑:张子怡</p>
      `,
    };
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(article, null, 2));
    return;
  }

  let filePath = request.url;
  let questionIndex = filePath.indexOf('?');
  if (questionIndex != -1) {
    filePath = filePath.substring(0, questionIndex);
  }
  if (filePath == '/') {
    filePath = 'index.html';
  } else {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
      filePath = 'index.html';
    } 
  }

  let extname = String(path.extname(filePath)).toLowerCase();
  let mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.ico' : 'image/x-icon'
  };

  let contentType = mimeTypes[extname] || 'application/octet-stream';
  
  if (filePath.indexOf("/css") == 0 || filePath.indexOf("/js") == 0 ) {
    if (fs.existsSync('src/' + filePath)) {
      filePath = 'src/' + filePath;
    } else {
      filePath = 'www/' + filePath;
    }
  } else {
    filePath = 'www/' + filePath;
  }

  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    filePath += '/index.html';
    contentType = 'text/html';
  }

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if(error.code == 'ENOENT') {
        fs.readFile('public/404.html', function(error, content) {
          response.writeHead(404, { 'Content-Type': 'text/html' });
          response.end(content, 'utf-8');
        });
      }
      else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });

}).listen(port);
console.log(`Server running at http://${hostname}:${port}/`);