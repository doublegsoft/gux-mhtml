util = {};

/**
 * 
 */
util.append = function (container, html, empty) {
  let fragmentContainer = dom.create('div');
  fragmentContainer.style.height = '100%';
  fragmentContainer.style.width = '100%';
  empty = empty || false;
  let range = document.createRange();
  let fragment = range.createContextualFragment(html);
  if (empty !== false)
    container.innerHTML = '';
  container.appendChild(fragmentContainer);
  fragmentContainer.appendChild(fragment);
  let page = dom.find('[id^=page]', fragmentContainer);
  if (page) fragmentContainer.setAttribute('page-id', page.id);
  else fragmentContainer.setAttribute('page-id', 'page.not.in.database');
  return {
    id: page ?  page.id : '',
    container: fragmentContainer,
  };
};

util.message = function (errors) {
  if (!errors && errors.length == 0) {
    return;
  }
  let ret = '';
  for (let i = 0; i < errors.length; i++) {
    ret += errors[i].message + '<br>';
  }
  return ret;
};

util.prompt = function (errors) {
  if (!errors && errors.length == 0) {
    return;
  }
  for (let i = 0; i < errors.length; i++) {
    $(errors[i].element).addClass('is-invalid');
  }
};

util.render = function (containerId, templateId, data) {
  let source = document.getElementById(templateId).innerHTML;
  let template = Handlebars.compile(source);
  let html = template(data);

  let container = document.getElementById(containerId);
  container.innerHTML = html;
};

util.assemble = function (obj, objname) {
  if (typeof obj !== 'object')
    return;
  for (let key in obj) {
    let val = obj[key];
    if (typeof val === 'object') {
      obj[key + 'Id'] = val['id'];
    }
    if (key == 'id') {
      obj[objname + 'Id'] = val;
    } else if (key == 'name') {
      obj[objname + 'Name'] = val;
    }
  }
};

util.in = function (elementSelector) {
  let selectors = elementSelector.split(' ');
  let element = null;
  let elements = [];
  if (selectors.length == 1) {
    element = document.getElementById(elementSelector);
    elements.push(element);
  } else {
    element = document.getElementById(selectors[0]);
    elements = element.querySelectorAll(selectors[1]);
  }
  for (let i = 0; i < elements.length; i++) {
    element = elements[i];
    element.addEventListener('animationend', function() {
      this.classList.remove('animated', 'fadeIn');
      this.style.display = '';
      this.removeEventListener('animationend', function() {});
      this.removeEventListener('animationstart', function() {});
    });
    element.classList.remove('fadeOut', 'hide');
    element.classList.add('animated', 'fadeIn', 'show');
  }
};

util.out = function (elementSelector) {
  let selectors = elementSelector.split(' ');
  let element = null;
  let elements = [];
  if (selectors.length == 1) {
    element = document.getElementById(elementSelector);
    elements.push(element);
  } else {
    element = document.getElementById(selectors[0]);
    elements = element.querySelectorAll(selectors[1]);
  }
  for (let i = 0; i < elements.length; i++) {
    element = elements[i];
    element.addEventListener('animationend', function () {
      this.classList.remove('animated', 'fadeOut');
      this.removeEventListener('animationend', function () {
      });
    });
    element.classList.remove('fadeIn', 'show');
    element.classList.add('animated', 'fadeOut', 'hide');
  }
};

/**
 * Converts the javascript variable name to html data attribute name.
 *
 * @param {string} javascript variable name
 *
 * @return {string} html data attribute name
 */
util.nameAttr = function(name) {
  const names = [];
  let item = '';
  for (let i = 0; i < name.length; i++) {
    let ch = name.charAt(i);
    if (ch == ch.toUpperCase()) {
      names.push(item);
      item = '';
      item += ch.toLowerCase();
    } else {
      item += ch;
    }
  }
  if (item != '') {
    names.push(item);
  }
  return 'data-model-' + names.join('-');
};

/**
 * Converts html data attribute name to javascript variable name.
 *
 * @param {string} html data attribute name
 *
 * @return {string} javascript variable name
 */
util.nameVar = function(name, sep) {
  sep = sep || '-';
  if (name.indexOf(sep) == -1) return name;
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (i == 0) {
      ret += name;
    } else {
      ret += name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return ret;
};

util.camelcase = function(name, sep) {
  if (name.indexOf(sep) == -1) return name;
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (i == 0) {
      ret += name;
    } else {
      ret += name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return ret;
};

util.pascalcase = function(name, sep) {
  if (name.indexOf(sep) == -1) return name.charAt(0).toUpperCase() + name.slice(1);
  const names = name.split(sep);
  let ret = '';
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    ret += name.charAt(0).toUpperCase() + name.slice(1);
  }
  return ret;
};

util.clone = function(source, target) {
  source = source || {};
  for (let k in source) {
    target[k] = source[k];
  }
};

util.get = function(model) {
  let attrs = Array.prototype.slice.call(arguments, 1);
  let ret = {};
  for (let i = 0; i < attrs.length; i++) {
    ret[attrs[i]] = model[attrs[i]];
  }
  return ret;
};

util.isEmpty = function(obj) {
  let ret = 0;
  for (let key in obj) {
    ret++;
  }
  return ret == 0;
};

util.isBlank = function(obj) {
  let ret = 0;
  for (let key in obj) {
    if (obj[key] != null && obj[key] !== '') {
      ret++;
    }
  }
  return ret == 0;
};

util.getParameter = function(url, name) {
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

util.getParameters = function(url) {
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

util.isExisting = (array, obj, idField) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i][idField] === obj[idField])
      return true;
  }
  return false;
};

util.textSize = (text, font) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  canvas.remove();
  return {width: metrics.width, height: metrics.height};
};

util.base64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

util.randomId = () => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  const length = 6;
  let counter = 0;
  for (let i = 0; i < 2; i++) {
    counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    result += '_';
  }
  return result.substring(0, result.length - 1);
};

util.camelcaseAttribute = (objname, attrname) => {
  objname = objname.toLowerCase();
  attrname = attrname.toLowerCase();
  if (attrname == 'id' || attrname == 'name' || attrname == 'type') {
    attrname = objname + '_' + attrname;
  }
  return util.camelcase(attrname, '_');
};

util.nameAttribute = (objname, attrname, domainType) => {
  domainType = domainType || '';
  let domainObjectType = '';
  let domainObjectId = '';
  if (domainType.startsWith('&')) {
    domainObjectType = domainType.substring(1, domainType.indexOf('('));
    domainObjectId = domainType.substring(domainType.indexOf('(') + 1, domainType.indexOf(')'))
  }
  objname = objname.toLowerCase();
  attrname = attrname.toLowerCase();
  if (domainObjectType !== '') {
    if (attrname === domainObjectType) {
      attrname = domainObjectType + '_' + domainObjectId;
    } else {
      attrname = attrname + '_' + domainObjectType + '_' + domainObjectId;
    }
  }
  if (attrname == 'id' || attrname == 'name' || attrname == 'type') {
    attrname = objname + '_' + attrname;
  }
  return attrname;
};

util.safeValue = (obj, name) => {
  if (!obj) return '';
  let names = name.split('.');
  let ret = obj;
  for (let i = 0; i < names.length; i++) {
    ret = ret[names[i]];
    if (!ret) {
      return '';
    }
  }
  return ret || '';
};

util.safeSet = (obj, name, value) => {
  if (!value) return;
  let names = name.split('.');
  let ret = obj;
  for (let i = 0; i < names.length; i++) {
    if (i == names.length - 1) {
      ret[names[i]] = value;
    } else {
      if (typeof obj[names[i]] === 'undefined') {
        obj[names[i]] = {};
      }
      ret = obj[names[i]];
    }
  }
  return obj;
};

util.merge = (older, newer) => {
  let ret = {...older};
  for (let key in newer) {
    let val = newer[key];
    let type = typeof val;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      ret[key] = val;
    } else if (type === 'object') {
      ret[key] = util.merge(ret[key], val);
    }
  }
  return ret;
};
