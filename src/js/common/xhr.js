/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
xhr = {};

/**
 * @private
 */
xhr.url = function (url) {
  if (typeof HOST !== 'undefined' && url.indexOf('http') == -1) {
    url = HOST + url; 
  }
  return url;
};

xhr.params = function(url) {
  if (url.indexOf('?') == -1) return {};
  let ret = {};
  url = url.substring(url.indexOf('?') + 1);
  let strs = url.split('&');
  for (let i = 0; i < strs.length; i++) {
    let pair = strs[i].split('=');
    if (pair.length == 1) return {};
    ret[pair[0].trim()] = decodeURIComponent(pair[1].trim());
  }
  return ret;
};

/**
 * @private
 */
xhr.request = function (opts, method) {
  let url = xhr.url(opts.url);
  let params = xhr.params(url);
  let data = opts.data || opts.params || {};
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  data = {...params, ...data};

  return new Promise((resolve,reject) => {
    let request  = new XMLHttpRequest();
    // request.timeout = 10 * 1000;
    request.onload = function () {
      let resp = request.responseText;
      if (type == 'json')
        try {
          resp = JSON.parse(resp);
        } catch (err) {
          console.log(err)
          reject(err)
          return;
        }
      if (request.readyState == 4 && request.status == "200") {
        resolve(resp)
      } else {
        reject(resp)
      }
    };
    request.onerror = function () {
      reject({error: {code: -500, message: '网络访问错误！'}})
    };
    request.ontimeout = function () {
      reject({error: {code: -501, message: '网络请求超时！'}})
    };
    request.open(method, url, true);
    request.setRequestHeader("Content-Type", "application/json");
    if (opts.headers) {
      for (let key in opts.headers) {
        request.setRequestHeader(key, opts.headers[key]);
      }
    }      
    if (data)
      request.send(JSON.stringify(data));
    else
      request.send(null);
  });
};

xhr.get = function (opts) {
  let url = opts.url;
  let data = opts.data;
  let success = opts.success;
  let error = opts.error;
  return new Promise((resolve,reject) => {
    let req  = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
      resolve(req.responseText);
    };
    req.send(null);
  });
};

xhr.post = function (opts) {
  return xhr.request(opts, 'POST');
};

xhr.put = function (opts) {
  return xhr.request(opts, 'PUT');
};

xhr.patch = function (opts) {
  return xhr.request(opts, 'PATCH');
};

xhr.delete = function (opts) {
  return xhr.request(opts, 'DELETE');
};

xhr.connect = function (opts) {
  return xhr.request(opts, 'CONNECT');
};

if (typeof module !== 'undefined') {
  module.exports = { xhr };
}