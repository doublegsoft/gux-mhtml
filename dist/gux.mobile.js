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
dom = {};

/**
 * Creates a dom element.
 *
 * @param tag
 *        the tag name, and css classes
 *
 * @returns {any}
 *        the html element
 */
dom.create = function (tag) {
  let classes = Array.prototype.slice.call(arguments, 1);
  let ret = document.createElement(tag);
  for (let i = 0; i < classes.length; i++) {
    ret.classList.add(classes[i]);
  }
  return ret;
};

dom.append = function (container, html, empty) {
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

/**
 * Finds all elements which are matching selector under parent or html document.
 *
 * @param selector
 *        the css selector
 *
 * @param parent
 *        the parent element or nothing
 *
 * @returns {any}
 *        the found single element or many elements as an array
 */
dom.find = function(selector, parent) {
  parent = parent || document;
  if (typeof selector !== 'string') return selector;
  let found = parent.querySelectorAll(selector);
  if (found.length == 0) return null;
  if (found.length == 1)  return found[0];
  return found;
};

/**
 * Finds the ancestor matching tag name for the given element.
 *
 * @param selector
 *        the element selector
 *
 * @param tag
 *        the element tag name
 */
dom.ancestor = function(selector, tag, clazz) {
  let element = null;
  clazz = clazz || '';
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  if (element == null) return null;
  tag = tag.toUpperCase();
  let found = element;
  if (clazz == '') {
    while (found != null && found.tagName != tag) {
      found = found.parentElement;
    }
  } else {
    while (found != null && !(found.tagName == tag && found.classList.contains(clazz))) {
      found = found.parentElement;
    }
  }

  return found;
};

/**
 *
 * @param html
 * @returns {null|Element}
 */
dom.element = function (html) {
  let div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
};

// dom.clickIn = function (selector, x, y) {
//   let element = null;
//   if (typeof selector === 'string') {
//     element = document.querySelector(selector);
//   } else {
//     element = selector;
//   }
//   let clicked = document.elementFromPoint(x, y);
// };

dom.bind = function (selector, event, handler) {
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  if (element == null)  return;
  if (element)
    // element['on' + event] = handler;
    element.addEventListener(event, handler);
};

/**
 * Gets or sets element data attribute values which element is matching to the selector.
 *
 * @param {Element} selector
 *        the element selector
 *
 * @param {object} data
 *        the data to set to html element, and if is undefined would get data from html element
 */
dom.model = function(selector, data) {
  let elm = null;
  if (typeof selector === 'string')
    elm = document.querySelector(selector);
  else
    elm = selector;
  if (typeof data !== 'undefined') {
    // set
    let attrs = Array.prototype.slice.call(arguments, 2);
    if (attrs.length == 0) {
      for (const key in data) {
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(util.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(util.nameAttr(key), data[key]);
        }
      }
    } else {
      for (let i = 0; i < attrs.length; i++) {
        let key = attrs[i];
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(util.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(util.nameAttr(key), data[key]);
        }
      }
    }
  } else {
    let ret = {};
    Array.prototype.slice.call(elm.attributes).forEach(function(attr) {
      if (attr.name.indexOf('data-model-') == 0) {
        if (attr.value.indexOf('{') == 0) {
          try {
            ret[util.nameVar(attr.name.slice('data-model-'.length))] = JSON.parse(attr.value);
          } catch (err) {
            ret[util.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
          }
        } else {
          ret[util.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
        }
      }
    });
    return ret;
  }
};

/**
 * Collects html attribute values which elements are matching to the given selector.
 *
 * @param {string} selector
 *        the element selector
 *
 * @param {string} {array} name
 *        the attribute name or names
 *
 * @returns {array}
 *        the attribute values
 */
dom.collect = function (selector, name) {
  let ret = [];
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let item = {};
    if (Array.isArray(name)) {
      for (let j = 0; j < name.length; j++) {
        item[name[j]] = elements[i].getAttribute(util.nameAttr(name[j]));
      }
    } else {
      item[name] = elements.getAttribute(util.nameAttr(name[j]));
    }
    ret.push(item);
  }
  return ret;
};

/**
 * Creates a child element and appends to container element.
 *
 * @param {element} container
 *        the container element
 *
 * @param {object} data
 *        the data for child element
 *
 * @param {string} {array} name
 *        the data names to set to element
 *
 * @param {function} creator
 *        the creator function to create element
 */
dom.propagate = function (container, data, name, creator) {
  let element = creator(data);
  if (Array.isArray(name)) {
    for (let i = 0; i < name.length; i++) {
      element.setAttribute(util.nameAttr(name[i]), data[name[i]]);
    }
  } else {
    element.setAttribute(util.nameAttr(name), data[name]);
  }
  container.appendChild(element);
};

dom.toggle = function (selector, resolve) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    element.addEventListener('click',  function() {
      let toggle = this.getAttribute('data-toggle');
      let strs = toggle.split('>>');
      let sources = strs[0].split('+');
      let targets = strs[1].split('+');

      let sourceMatched = false;
      let targetMatched = false;
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i].trim();
        if (source.indexOf('.') == 0) {
          sourceMatched = this.classList.contains(source.substring(1));
        } else {
          let child = this.querySelector(source);
          sourceMatched = child != null;
        }
      }
      if (sourceMatched) {
        for (let i = 0; i < targets.length; i++) {
          let target = targets[i].trim();
          if (target.indexOf('.') === 0) {
            this.classList.add(target.substring(1));
          } else {
            let child = this.querySelector(target.substring(0, target.indexOf('.')));
            child.classList.add(target.substring(target.indexOf('.') + 1));
          }
        }
        for (let i = 0; i < sources.length; i++) {
          let source = sources[i].trim();
          if (source.indexOf('.') == 0) {
            this.classList.remove(source.substring(1));
          } else {
            let child = this.querySelector(source);
            child.classList.remove(source.substring(source.indexOf('.') + 1));
          }
        }
        return;
      }
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i].trim();
        if (source.indexOf('.') == 0) {
          this.classList.add(source.substring(1));
        } else {
          let child = this.querySelector(source.substring(0, source.indexOf('.')));
          child.classList.add(source.substring(source.indexOf('.') + 1));
        }
      }
      for (let i = 0; i < targets.length; i++) {
        let target = targets[i].trim();
        if (target.indexOf('.') == 0) {
          this.classList.remove(target.substring(1));
        } else {
          let child = this.querySelector(target);
          child.classList.remove(target.substring(target.indexOf('.') + 1));
        }
      }
      if (resolve) resovle(this);
    });
  }
};

/**
 *
 * @param selector
 * @param resolve
 */
dom.switch = function (selector, resolve) {
  let container = dom.find(selector);
  let accordion = container.getAttribute('data-switch');
  let sources = accordion.split('+');
  let elements = container.querySelectorAll(sources[0]);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    element.onclick = ev => {
      // clear all
      let siblings = container.querySelectorAll(sources[0]);
      for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.remove(sources[1].substring(1));
      }
      element.classList.add(sources[1].substring(1));
      if (resolve) resolve(element);
    };
  }
};

dom.tabs = function(tabsSelector) {
  let tabs = dom.find(tabsSelector);
  if (tabs == null) return;
  let activeClass = tabs.getAttribute('data-tab-active-class');
  for (let i = 0; i < tabs.children.length; i++) {
    let el = tabs.children[i];
    el.addEventListener('click', (ev) => {
      for (let i = 0; i < tabs.children.length; i++) {
        let el = tabs.children[i];
        el.classList.remove(activeClass);
      }
      el.classList.add(activeClass);
    })
  }
};

/**
 * Gets the top location Y of the given element in client area.
 *
 * @param selector
 *        the css selector
 *
 * @returns {number} the element Y value.
 */
dom.top = function (selector) {
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  // let ret = 0;
  // do {
  //   if ( !isNaN( element.offsetTop ) )
  //   {
  //     ret += element.offsetTop;
  //   }
  // } while (element = element.offsetParent);
  // return ret;
  if (element == null) return 0;
  let ret = element.offsetTop;
  if (typeof element.offsetParent !== 'undefined') {
    ret += dom.top(element.offsetParent);
  }
  return ret;
};

/**
 * Gets data from container element matching selector or
 * Sets data to it.
 *
 * @param selector
 *        the container selector
 *
 * @param data
 *        the data or undefined
 */
dom.formdata = function(selector, data) {
  let container = null;
  if (typeof selector === 'string') {
    container = document.querySelector(selector);
  } else {
    container = selector;
  }
  if (typeof data === 'undefined') {
    // get form data
    let values = {};

    // INPUT
    let checkboxCount = {};
    let inputs = container.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      let name = input.name;
      let type = input.type;
      let value = input.value;
      if (type == 'text' || type == 'number' || type == 'password' || type == 'hidden') {
        values[name] = null;
        if (value != '') {
          if (name.indexOf('[]') != -1) {
            values[name] = [value];
          } else {
            values[name] = value;
          }
        } else {
          values[name] = '';
        }
      } else if (type == 'radio') {
        // values[name] = null;
        if (input.checked) {
          values[name] = value;
        }
      } else if (type == 'checkbox') {
        // values[name] = [];
        if (typeof checkboxCount[name] === 'undefined') {
          checkboxCount[name] = 0;
        }
        if (input.checked) {
          if (typeof values[name] === 'undefined') {
            checkboxCount[name] = 0;
            values[name] = [];
          }
          values[name].push(value);
        }
        checkboxCount[name] += 1;
      }
    }
    // SELECT
    let selects = container.querySelectorAll('select');
    for (let i = 0; i < selects.length; i++) {
      let select = selects[i];
      let name = select.name;
      values[name] = null;
      if (select.selectedIndex != -1) {
        if (name.indexOf('[]') != -1) {
          values[name] = [select.value];
        } else {
          values[name] = select.value;
        }
      } else {
        values[name] = '';
      }
    }
    // TEXTAREA
    let textareas = container.querySelectorAll('textarea');
    for (let i = 0; i < textareas.length; i++) {
      let textarea = textareas[i];
      let name = textarea.name;
      values[name] = null;
      // if (textarea.innerHTML.trim() != '') {
      //   values[name] = textarea.innerHTML.replaceAll('<br>', '\n');
      // } else {
      //   values[name] = textarea.value;
      // }
      values[name] = textarea.value;
    }
    // 名称下只存在一个checkbox，就不用变成数组了
    for (let name in checkboxCount) {
      if (name.indexOf('[]') != -1) continue;
      if (checkboxCount[name] == 1 && values[name]) {
        values[name] = values[name][0];
      }
    }
    // 处理模板赋值
    for (let name in values) {
      if (typeof values[name] === 'string' && values[name].indexOf('${') == 0) {
        values[name] = values[values[name].substring(2, values[name].length - 1)];
      }
    }
    return values;
  } else {

    function getValue(obj, name) {
      if (name.indexOf('.') == 0) {
        let parentName = name.substring(0, name.indexOf('.'));
        let childName = name.substring(name.indexOf('.') + 1);
        return getValue(obj[parentName], childName);
      }
      if (typeof obj[name] === 'undefined') return '';
      return obj[name];
    }

    function setValue(container, name, val) {
      let el = dom.find('[name=\'' + name + '\']', container);
      if (el == null) return;
      if (el.length > 1) {
        if (el[0].type == 'radio') {
          let radios = el;
          radios.forEach((el, idx) => {
            if (el.value === val) {
              el.checked = true;
            } else {
              el.checked = false;
            }
          });
        }
      }
      if (el.tagName == 'INPUT') {
        if (el.type == 'check') {
          // TODO
        } else {
          el.value = val || '';
        }
      } else if (el.tagName == 'SELECT') {
        $('select[name=\'' + name + '\']').val(val).trigger('change');
      } else if (el.tagName == 'TEXTAREA') {
        el.innerHTML = val;
      }
    }

    for (let key in data) {
      if (typeof data[key] === 'object') {
        for (let innerKey in data[key]) {
          setValue(container, key + '.' + innerKey, data[key][innerKey]);
        }
      } else {
        setValue(container, key, data[key]);
      }
    }
  }
};

dom.enable = function(selector) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = false;
  }
};

dom.disable = function(selector) {
  let elements;
  if (typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  } else {
    elements = selector;
  }
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = true;
  }
};

/**
 * Gets the index of selector element under its parent element.
 *
 * @param selector
 *        the selector string or dom element
 *
 * @param fieldId
 *        the model id field name
 *
 * @param id (optional)
 *        the model id value
 */
dom.index = function(selector, fieldId, id) {
  let element;
  if (typeof selector === 'string')
    element = dom.find(selector);
  else
    element = selector;
  if (id) {

  } else {
    let elementModelId = element.getAttribute(fieldId);
    let children = element.parentElement.querySelectorAll(element.tagName);
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      let childModelId = child.getAttribute(fieldId);
      if (elementModelId == childModelId) {
        return i;
      }
    }
  }
  return -1;
};

dom.elementAt = function (selector, fieldId, id) {
  let children = document.querySelectorAll(selector);
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childModelId = child.getAttribute(fieldId);
    if (id == childModelId) {
      return {index: i, element: child};
    }
  }
  return null;
};

dom.elementAtTree = function (selector, fieldId, fieldParentId, id, parentId) {
  let children = document.querySelectorAll(selector);
  let index = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childModelId = child.getAttribute(fieldId);
    let childModelParentId = child.getAttribute(fieldParentId);
    if (parentId == childModelParentId) {
      index++;
      if (id == childModelId) {
        return {index: index, element: child};
      }
    }
  }
};

/*
* 根据父元素和偏移量重新制定元素的高度
*  @param element
* */

dom.autoheight = function (selector, ancestor, customOffset) {
  customOffset = customOffset || 0;
  let el = dom.find(selector);
  if (el == null) return;
  ancestor = ancestor || document.body;
  let rectAncestor = ancestor.getBoundingClientRect();

  let height = rectAncestor.height;
  if (ancestor === document.body) {
    height = window.innerHeight;
  }

  let parent = el.parentElement;
  let rectParent = parent.getBoundingClientRect();
  let rect = el.getBoundingClientRect();
  let parentOffsetTop = parseInt(parent.offsetTop);

  let top = rect.top - rectAncestor.top;
  // 计算底部的高度
  let bottom = 0;
  while (parent !== ancestor) {
    if (!parent) break;
    let style = getComputedStyle(parent);
    bottom += parseInt(style.paddingBottom);
    bottom += parseInt(style.marginBottom);
    bottom += parseInt(style.borderBottomWidth);
    parent = parent.parentElement;
  }
  let style = getComputedStyle(el);
  bottom += parseInt(style.borderBottomWidth);

  el.style.height = (height - bottom - customOffset - top) + 'px';
  el.style.overflowY = 'auto';
};

dom.templatize = function(template, model) {
  let tpl = Handlebars.compile(template);
  let html = tpl(model);
  return dom.element(html);
};

dom.init = function (owner, element) {
  if (!element) return;
  let name = element.getAttribute('name');
  if (!name || name == '') {
    name = element.getAttribute('widget-id');
  }
  if (name && name != '') {
    owner[name] = element;
  }
  // 提示
  let tooltip = element.getAttribute('widget-model-tooltip');
  if (tooltip && tooltip != '') {
    tippy(element, {
      content: tooltip,
    });
  }
  for (let i = 0; i < element.children.length; i++) {
    let child = element.children[i];
    dom.init(owner, child);
  }
};

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
if (typeof Handlebars !== "undefined") {
  Handlebars.registerHelper('ifeq', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
}

if (typeof gux === 'undefined') gux = {};



gux = {
  routedPages: [],
  presentPageObj: null,
  safeTop: 44,
  navigationBarHeight: 44,
};

gux.switchTab = function(url, opt) {
  clearTimeout(gux.delayToLoad);
  let clear = opt.clear;
  if (typeof clear === "undefined") clear = false;
  let container = document.getElementById('container');

  if (gux.presentPageObj) {
    gux.presentPageObj.page.parentElement.classList.remove('in');
    gux.presentPageObj.page.parentElement.classList.add('out');
    gux.presentPageObj.page.parentElement.style.display = 'none';
  }

  let existingPage = dom.find('[gux-page-url="' + url + '"]', container);

  if (existingPage) {
    gux.presentPageObj = window[existingPage.getAttribute('gux-page-id')];
    gux.presentPageObj.page.parentElement.style.display = '';
    gux.presentPageObj.page.parentElement.classList.remove('out');
    gux.presentPageObj.page.parentElement.classList.add('in');
    return;
  }
  /*!
  ** 加载未加载过的页面
  */
  gux.delayToLoad = setTimeout(async () => {
    if (gux.presentPageObj) {
      gux.presentPageObj.page.parentElement.style.display = 'none';
    }
    if (gux.presentPageObj && clear !== false) {
      gux.presentPageObj.page.parentElement.remove();
      if (gux.presentPageObj.destroy) {
        gux.presentPageObj.destroy();
      }
      delete gux.presentPageObj;
    }
    let html = await xhr.get({
      url: url + (url.indexOf('?') == -1 ? '?' : '&') + new Date().getTime(),
    }, 'GET');
    gux.reload(container, url, html, opt);
  }, 200);
};

gux.navigateTo = async function (url, opt, clear) {
  clearTimeout(gux.delayToLoad);
  if (typeof clear === "undefined") clear = false;
  let container = document.getElementById('container');

  gux.delayToLoad = setTimeout(async () => {
    if (gux.presentPageObj && clear !== false) {
      gux.presentPageObj.page.parentElement.remove();
      if (gux.presentPageObj.destroy) {
        gux.presentPageObj.destroy();
      }
      delete gux.presentPageObj;
    }
    let html = await xhr.get({
      url: url + (url.indexOf('?') == -1 ? '?' : '&') + new Date().getTime(),
    }, 'GET');
    gux.reload(container, url, html, opt);
  }, 200);
};

gux.navigateBack = function (opt) {
  clearTimeout(gux.delayToLoad);
  gux.delayToLoad = setTimeout(() => {
    let container = document.getElementById('container');
    let latest = container.children[container.children.length - 2];

    let pageContainer = gux.presentPageObj.page.parentElement;
    pageContainer.classList.remove('in');
    pageContainer.classList.add('out');

    setTimeout(() => {
      gux.presentPageObj.page.parentElement.remove();
      if (gux.presentPageObj.destroy) {
        gux.presentPageObj.destroy();
      }
      delete gux.presentPageObj;

      // latest.style.display = '';
      gux.presentPageObj = window[latest.getAttribute('gux-page-id')];

      let pageContainer = gux.presentPageObj.page.parentElement;

      if (gux.presentPageObj.noBottomNavigator == true) {
        pageIndex.hideBottomNavigator();
      } else {
        pageIndex.showBottomNavigator();
      }
    }, 600 /*同CSS中的动画效果配置时间一致*/);
  }, 200);
};

/*!
** 加载页面的核心函数，处理了导航栏和页面的渲染，同时根据页面对象的设置决定
** 是否显示和如何显示导航栏，医技底部导航栏。如果目标页不存在或者加载失败，
** 则显示“正在建设中”的页面。
*/
gux.reload = function (container, url, html, opt) {
  opt = opt || {};
  let fragmentContainer = dom.element(`<div class="gx page" style="height: 100%; width: 100%;position:fixed;top:0;"></div>`);
  let range = document.createRange();
  let fragment = range.createContextualFragment(html);
  fragmentContainer.appendChild(fragment);
  let page = dom.find('[id^=page]', fragmentContainer);
  if (!page) {
    fragment = range.createContextualFragment(`
<div id="pageUnderConstruction" class="page" style="overflow-y:auto;">
  <div class="gx-d-flex gx-w-full gx-h-full">
    <img class="gx-m-auto" src="/img/app/under-construction.png" style="width:80%;">
  </div>
</div>
<script>
function PageUnderConstruction() {
  this.page = document.getElementById('pageUnderConstruction');
  this.title = '正在建设中...';
  this.noBottomNavigator = true;
}

PageUnderConstruction.prototype.initialize = function() {
  dom.init(this, this.page);
  this.page.style.height = app.getViewHeight() + 'px';
};

PageUnderConstruction.prototype.show = function() {
  this.initialize();
};

pageUnderConstruction = new PageUnderConstruction();
</script>
    `);
    fragmentContainer.appendChild(fragment);  
    page = dom.find('[id^=page]', fragmentContainer);
  }
  let pageId = page.getAttribute('id');
  page.style.height = page.parentElement.parentElement.style.height;
  page.style.overflowY = 'auto';

  container.appendChild(fragmentContainer);

  fragmentContainer.setAttribute('gux-page-id', pageId);
  fragmentContainer.setAttribute('gux-page-url', url);

  if (opt.title) {
    fragmentContainer.setAttribute('gux-page-title', opt.title);
  }
  if (opt.icon) {
    fragmentContainer.setAttribute('gux-page-icon', opt.icon || '');
  }

  gux.presentPageObj = window[pageId];

  if (gux.presentPageObj.noNavigationBar !== true) {
    opt.title = gux.presentPageObj.title || opt.title;
    opt.icon = gux.presentPageObj.icon || opt.icon;
    if (typeof opt.icon === 'undefined') {
      opt.icon = '<i class="gx-i gx-i-arrow-left gx-pos-relative gx-text-inverse gx-fs-28 gx-fb" style="bottom: -50%;left: 18px;"></i>';
    }
    let navigationBar = dom.templatize(`
      <div widget-id="navigation-bar" 
            class="gx-bg-primary gx-d-flex gx-w-full" 
            style="height:{{height}}px;position:fixed;top:0;z-index:99;">
        <div widget-id="navigation-bar-icon" style="width: 100px;">{{{icon}}}</div>
        <div class="gx-d-flex gx-py-8" style="flex: 1;align-items: end;justify-content: center;">
          <div id="navigation-bar-title" class="gx-text-inverse gx-fs-22">{{title}}</div>
        </div>
        <div style="width: 100px;"></div>
      </div>
    `, {
      height: (gux.safeTop + gux.navigationBarHeight),
      ...opt,
    });
    let page = gux.presentPageObj.page;
    /*!
    ** 自定义导航栏
    */
    if (gux.presentPageObj.navigationBar) {
      navigationBar.innerHTML = '';
      navigationBar.appendChild(gux.presentPageObj.navigationBar);
    }
    page.style.top = (gux.safeTop + gux.navigationBarHeight) + 'px';
    fragmentContainer.insertBefore(navigationBar, fragmentContainer.firstChild);

    let butttonBack = dom.find('.gx-i.gx-i-arrow-left', fragmentContainer);
    if (butttonBack != null) {
      butttonBack.onclick = (ev) => {
        gux.navigateBack();
      }
    }
  }

  /*!
  **
  */
  let params = util.getParameters(url);
  gux.presentPageObj.show(params);

  if (gux.presentPageObj.noBottomNavigator == true) {
    pageIndex.hideBottomNavigator();
  } else {
    pageIndex.showBottomNavigator();
  }

  /*!
  ** 动画加载页面。
  */
  fragmentContainer.classList.add('in');
  setTimeout(() => {
    fragmentContainer.classList.remove('in');
  }, 600);

  /*!
  ** 成功回调。
  */
  if (opt.success) {
    opt.success();
  }
};

/*!
** 从底部向上弹出的界面，并且附带屏蔽页。
*/
gux.popup = function (opt) {
  let container = opt.container || document.body;
  let content = opt.content;
  let popup = dom.templatize(`
    <div class="gx popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom in">
        <div class="popup-title">
          <button class="cancel" style="right:8px;">关闭</button>
        </div>
        <div class="popup-content" style="height: {{height}}px; width: 100%;"></div>
      </div>
    </div>
  `, opt);
  

  let bottom = dom.find('.popup-bottom', popup);
  let mask = dom.find('.popup-mask', popup);
  let cancel = dom.find('.cancel', popup);

  bottom.children[1].appendChild(content);
  dom.bind(cancel, 'click', ev => {
    bottom.classList.remove('in');
    bottom.classList.add('out');
    setTimeout(() => {
      bottom.parentElement.remove();
    }, 300);
  });

  container.appendChild(popup);
};

gux.dialog = function (opt) {
  let confirm = opt.confirm;
  let cancel = opt.cancel;
  let content = opt.content;
  let mask = dom.element(`
    <div style="background: rgba(0,0,0,0.3); position: absolute; top: 0; left: 0; 
                z-index: 9999; height: 100%; width: 100%; display: flex;">
      <div class="dialog m-auto" 
           style="width: 88%; min-height: 400px; position: relative;
                  background: var(--color-white);">
        <div class="dialog-body">${content}</div>
        <div class="dialog-footer" 
             style="font-size: 24px; font-weight: bold; position: absolute;
                    width: 100%; height: 56px; bottom: 0; display: table;">
          <button style="background: var(--color-error); width: 50%; display: inline-table;
                         color: var(--color-text-primary-dark); border: none; 
                         line-height: 56px;">取  消</button>
          <button style="background: var(--color-primary); width: 50%; display: inline-table;
                         color: var(--color-text-primary-dark); border: none; 
                         line-height: 56px;">确  定</button>
        </div>
      </div>
    </div>
  `);
  let buttons = mask.querySelectorAll('button');
  dom.bind(buttons[0], 'click', ev => {
    mask.remove();
    if (cancel) cancel();
  });
  dom.bind(buttons[1], 'click', ev => {
    mask.remove();
    if (confirm) confirm();
  });
  document.body.appendChild(mask);
};

gux.replace = function (container, url, html, opt) {
  opt = opt || {};
  let fragmentContainer = dom.element(`<div style="height: 100%; width: 100%;"></div>`);
  let range = document.createRange();
  let fragment = range.createContextualFragment(html);
  container.appendChild(fragment);

  let page = dom.find('[id^=page]', container);
  let pageId = page.getAttribute('id');

  if (opt.title) {
    fragmentContainer.setAttribute('gux-page-title', opt.title);
    fragmentContainer.setAttribute('gux-page-icon', opt.icon || '');
  }page.classList.add('in');

  let params = util.getParameters(url);
  window[pageId].show(params);

  // pass options to page object
  for (let key in opt) {
    window[pageId][key] = opt[key];
  }

  if (opt.success) {
    opt.success();
  }
};

gux.select = async function(opt) {
  let rows = await xhr.promise({
    url: opt.url,
    params: opt.params || {},
  });
  let data = [];
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    data.push({
      id: row[opt.fieldId || 'id'],
      value: row[opt.fieldName || 'value'],
    });
  }
  new MobileSelect({
    trigger: opt.trigger,
    title: opt.title,
    wheels: [{
      data: data,
    }],
    callback: (indexArr, data) => {
      if (opt.onSelected) {
        opt.onSelected(data[0]);
      }
    },
  });
};

gux.tabs = function(opt) {
  let container = dom.find(opt.container);
  let tabNavigators = dom.element(`
    <div class="nav nav-tabs mt-0"></div>
  `);
  let tabContents = dom.element(`
    <div class="swiper">
      <div class="swiper-wrapper">
      </div>
    </div>
  `);
  let tabs = opt.tabs;
  for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    let tabNavigator = dom.templatize(`
      <div class="nav-item font-weight-bold mr-0" 
           style="padding: 0 16px; line-height: 36px; text-align: center; flex: 1;">{{title}}</div>
    `, tab);
    tabNavigators.appendChild(tabNavigator);
    if (i == 0) {
      tabNavigator.classList.add('active-bg-info');
    }
    dom.bind(tabNavigator, 'click', (ev) => {
      swiper.slideTo(i, 400, true);
    });

    let tabContent = dom.templatize(`
      <div class="swiper-slide full-width"></div>
    `, tab);
    if (tab.render) {
      tab.render(tabContent, tab.params || {});
    } else {
      tabContent.innerHTML = '<img src="https://via.placeholder.com/240x150">';
    }
    tabContents.children[0].appendChild(tabContent);
  }
  container.appendChild(tabNavigators);
  container.appendChild(tabContents);

  let swiper = new Swiper(tabContents, {
    direction: 'horizontal',
    loop: false,
  });
  swiper.on('slideChange', function (ev) {
    let index = ev.activeIndex;
    for (let i = 0; i < tabNavigators.children.length; i++) {
      tabNavigators.children[i].classList.remove('active-bg-info');
    }
    tabNavigators.children[index].classList.add('active-bg-info');
  });
};

gux.wizard = function(opt) {
  let container = dom.find(opt.container);
  let stepNavigators = dom.element(`
    <div class="wizard"></div>
  `);
  let stepContents = dom.element(`
    <div class="swiper">
      <div class="swiper-wrapper">
      </div>
    </div>
  `);
  let steps = opt.steps;
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];
    step.index = i + 1;
    let stepNavigator = dom.templatize(`
      <div class="wizard-step">
        <div class="wizard-dot">
          <div class="wizard-connector-left"></div>
          <div class="wizard-number">{{index}}</div>
          <div class="wizard-connector-right"></div>
        </div>
      </div>
    `, step);
    stepNavigators.appendChild(stepNavigator);

    dom.bind(stepNavigator, 'click', (ev) => {
      if (!stepNavigator.classList.contains('wizard-step-completed')) return;
      swiper.slideTo(i, 400, true);
    });

    let stepContent = dom.templatize(`
      <div class="swiper-slide full-width"></div>
    `, step);
    if (step.render) {
      step.render(stepContent, step.params || {});
    } else {
      stepContent.innerHTML = '<img src="https://via.placeholder.com/240x150">';
    }
    stepContents.children[0].appendChild(stepContent);
  }
  container.appendChild(stepNavigators);
  container.appendChild(stepContents);

  let swiper = new Swiper(stepContents, {
    direction: 'horizontal',
    loop: false,
  });
  swiper.on('slideChange', ev => {
    let index = ev.activeIndex;
    for (let i = 0; i < stepNavigators.children.length; i++) {
      stepNavigators.children[i].classList.remove('wizard-step-completed');
    }
    for (let i = 0; i < index; i++) {
      stepNavigators.children[i].classList.add('wizard-step-completed');
    }
  });
  swiper.on('sliderMove', (swiper, ev) => {

  });
  return swiper;
};

gux.overlay = function() {

};

gux.success = function(message, callback) {
  let el = dom.templatize(`
    <div class="toast">
      <i class="far fa-check-circle font-36"></i>
      <div class="font-18 mt-2">${message}</div>
    </div>
  `);
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('show');
  }, 50);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => {
      el.remove();
      if (callback)
        callback();
    }, 500);
  }, 1000);
};

gux.error = function(message, callback) {
  let el = dom.templatize(`
    <div class="toast">
      <i class="far fa-times-circle font-36"></i>
      <div class="font-18 mt-2">${message}</div>
    </div>
  `);
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('show');
  }, 50);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => {
      el.remove();
      if (callback)
        callback();
    }, 500);
  }, 1000);
};

gux.loading = function(callback) {
  if (document.getElementById('__widgetLoading') != null) return;
  let el = dom.templatize(`
    <div id="__widgetLoading" style="background: rgba(0,0,0,0.3); position: absolute; top: 0; left: 0; 
                z-index: 9999; height: 100%; width: 100%; display: flex; color: white">
      <div class="m-auto" style="text-align: center;">
        <i class="fas fa-spinner fa-spin font-36"></i>
        <div class="font-18 mt-2">数据加载中</div>
      </div>          
    </div>
  `);
  document.body.appendChild(el);
  setTimeout(() => {
    if (callback)
      callback(el);
  }, 300);
};

pStart = { x: 0, y: 0 };
pStop = { x: 0, y: 0 };

gux.swipeStart = function(e) {
  if (typeof e["targetTouches"] !== "undefined") {
    let touch = e.targetTouches[0];
    pStart.x = touch.screenX;
    pStart.y = touch.screenY;
  } else {
    pStart.x = e.screenX;
    pStart.y = e.screenY;
  }
};

gux.swipeEnd = function(e) {
  if (typeof e["changedTouches"] !== "undefined") {
    let touch = e.changedTouches[0];
    pStop.x = touch.screenX;
    pStop.y = touch.screenY;
  } else {
    pStop.x = e.screenX;
    pStop.y = e.screenY;
  }
};

gux.swipeCheck = function() {
  let changeY = pStart.y - pStop.y;
  let changeX = pStart.x - pStop.x;
  return gux.isPullDown(changeY, changeX);
};

gux.isPullDown = function (dY, dX) {
  // methods of checking slope, length, direction of line created by swipe action
  return (
    dY < 0 &&
    ((Math.abs(dX) <= 100 && Math.abs(dY) >= 300) ||
      (Math.abs(dX) / Math.abs(dY) <= 0.3 && dY >= 60))
  );
};

document.addEventListener("touchstart", gux.swipeStart, false);
document.addEventListener("touchend", ev => {
  gux.swipeEnd(ev);
  if (gux.swipeCheck()) {
    let rect = gux.presentPageObj.page.getBoundingClientRect();
    if (gux.presentPageObj && gux.presentPageObj.pullToRefresh) {
      let rect = gux.presentPageObj.page.getBoundingClientRect();
      if (rect.top >= 0) {
        gux.loading(el => {
          gux.presentPageObj.pullToRefresh(el);
        });
      }
    }
  }
}, false);
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

var NO_ERRORS = 0;
var REQUIRED_ERROR = 1;
var FORMAT_ERROR = 2;
var INVALID_ERROR = 3;

// add string trim method if not existing
if (!String.prototype.trim) {
  (function () {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function () {
      return this.replace(rtrim, '');
    };
  })();
}

Validation = {
  /**
   * 
   */
  validate: function (container, callback) {
    var ret = [];
    if (typeof container === 'undefined') {
      container = $(document);
    }
    if (typeof container === 'string') {
      container = $(container);
    } else {
      container = $(container);
    }
    // 输入框
    container.find('input[type!=checkbox][type!=radio][type!=button]').each(function (idx, el) {
      var val = $(el).val().trim();
      var label = Validation.getLabel(el);
      // 必填项校验
      var msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : label + '必须填写！';
      if (Validation.isRequired(el) && val === '') {
        ret.push({
          element: el,
          message: msg
        });
      }
      // 专用类型校验
      var expr = $(el).attr('data-domain-type');
      if (!expr) {
        return;
      }
      var msg = label + '填写不合要求。';
      var dt = Validation.getDomainValidator(new ValidationModel(expr));
      if (dt != null && val !== '') {
        var res = dt.test(val);
        switch (res) {
          case REQUIRED_ERROR:
            break;
          case FORMAT_ERROR:
            msg = $(el).attr('data-format-message') ? $(el).attr('data-format-message') : msg;
            break;
          case INVALID_ERROR:
            msg = $(el).attr('data-invalid-message') ? $(el).attr('data-invalid-message') : msg;
            break;
          default:
            break;
        }
        if (res != NO_ERRORS) {
          ret.push({
            element: $(el),
            message: msg
          });
        }
      }
    });
    container.find('textarea').each(function (idx, el) {
      var val = $(el).val().trim();
      var label = Validation.getLabel(el);
      // 必填项校验
      var msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : label + '必须填写！';
      if (Validation.isRequired(el) && val === '') {
        ret.push({
          element: el,
          message: msg
        });
      }
      // 专用类型校验
      var expr = $(el).attr('data-domain-type');
      if (!expr) {
        return;
      }
      var msg = label + '填写不合要求。';
      var dt = Validation.getDomainValidator(new ValidationModel(expr));
      if (dt != null && val !== '') {
        var res = dt.test(val);
        switch (res) {
          case REQUIRED_ERROR:
            break;
          case FORMAT_ERROR:
            msg = $(el).attr('data-format-message') ? $(el).attr('data-format-message') : msg;
            break;
          case INVALID_ERROR:
            msg = $(el).attr('data-invalid-message') ? $(el).attr('data-invalid-message') : msg;
            break;
          default:
            break;
        }
        if (res != NO_ERRORS) {
          ret.push({
            element: $(el),
            message: msg
          });
        }
      }
    });
    // 下拉框
    container.find('select').each(function (idx, el) {
      if (Validation.isRequired(el) && ($(el).val() == '-1' || $(el).val() == '' || $(el).val() == null)) {
        var label = Validation.getLabel(el);
        var msg = label + '必须选择！';
        msg = $(el).attr('data-required-message') ? $(el).attr('data-required-message') : msg;
        ret.push({
          element: $(el),
          message: msg
        });
      }
    });
    // 复选框
    var names = {};
    container.find('input[type=checkbox]').each(function (idx, el) {
      // 名称必须要有
      var name = $(el).attr('name');
      names[name] = name;
    });
    for (var name in names) {
      var checked = false;
      var label = null;
      var elm = null;
      container.find('input[name="' + name + '"]').each(function (idx, el) {
        if (idx == 0) {
          label = Validation.getLabel(el);
          elm = el;
        }
        if (!checked && $(el).prop('checked')) {
          checked = true;
        }
      });
      if (!checked && Validation.isRequired(elm)) {
        var msg = label + '必须选择！';
        msg = $(elm).attr('data-required-message') ? $(elm).attr('data-required-message') : msg;
        ret.push({
          element: $(elm),
          message: msg
        });
      }
    }
    // 单选框
    var names = {};
    container.find('input[type=radio]').each(function (idx, el) {
      // 名称必须要有
      var name = $(el).attr('name');
      names[name] = name;
    });
    for (var name in names) {
      var checked = false;
      var label = null;
      var elm = null;
      container.find('input[name="' + name + '"]').each(function (idx, el) {
        if (idx == 0) {
          label = Validation.getLabel(el);
          elm = el;
        }
        if (!checked && $(el).prop('checked')) {
          checked = true;
        }
      });
      if (checked === false && $(elm).prop('required')) {
        var msg = label + '必须选择！';
        // console.log(msg);
        msg = $(elm).attr('data-required-message') ? $(elm).attr('data-required-message') : msg;
        ret.push({
          element: $(elm),
          message: msg
        });
      }
    }
    // ajax验证
    container.find('input[remote]').each(function (idx, el) {
      var uri = $(el).attr('remote');
      var val = $(el).val().trim();
      if (uri && uri != '' && val != '') {
        $.ajax({
          url: uri,
          method: 'POST',
          data: "check=" + val,
          success: function (resp) {
            var obj = $.parseJSON(resp);
            if (obj.err) {
              ret.push({
                element: $(el),
                message: obj.msg
              });
            }
          }
        });
      }
    });
    if (callback) {
      callback(ret);
    }

    return ret;
  },

  getLabel: function (_el) {
    var el = $(_el);
    return el.attr('label') || $(el).attr("data-required") || (el.attr("name") || el.attr("id"));
  },

  isRequired: function(_el) {
    let el = $(_el);
    if (el.prop('required')) return true;
    if (el.attr('required') == 'required') return true;
    if (typeof el.attr('data-required') === 'undefined') return false;
    return el.attr('data-required') != '';
  },

  getDomainValidator: function (model) {
    var domain = model.keyword.toLowerCase();
    var vm = model;
    var ret = null;
    if (domain === 'mail' || domain === 'email') {
      ret = new Validation.Mail();
    } else if (domain === 'number') {
      ret = new Validation.Number(vm.symbol, vm.args);
    } else if (domain === 'string') {
      ret = new Validation.String(vm.args);
    } else if (domain === 'mobile') {
      ret = new Validation.Mobile();
    } else if (domain === 'range') {
      ret = new Validation.Range(vm.opts, vm.args);
    } else if (domain === 'phone') {
      ret = new Validation.Phone();
    } else if (domain === 'cmpexp') {
      ret = new Validation.CmpExp(vm.args[0], vm.args[1]);
    } else if (domain === 'regexp') {
      ret = new Validation.RegExp(vm.args[0]);
    } else if (domain === 'remote') {
      ret = new Validation.Remote(vm.args[0]);
    } else if (domain === 'date') {
      ret = new Validation.Date();
    } else if (domain === 'time') {
      ret = new Validation.Time();
    } else if (domain === 'datetime') {
      ret = new Validation.DateTime();
    } else {
      throw new Error('not support for the domain("' + domain + '")');
    }
    return ret;
  },

  String: function (args) {
    this.min = 0;
    this.max = parseInt(args[0]);
    if (args.length > 1) {
      this.min = parseInt(args[0]);
      this.max = parseInt(args[1]);
    }
    this.test = function (str) {
      if (str.length < this.min) {
        return FORMAT_ERROR;
      }
      if (this.max && str.length > this.max) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Number: function (sym, args) {
    var start = 7;
    this.plus = -1;
    this.minus = -1;
    if (sym === '-') {
      this.minus = 0;
    } else if (sym === '+') {
      this.plus = 0;
    }

    if (this.minus == 0 || this.plus == 0) {
      start += 1;
    }
    this.precision = parseInt(args[0]);
    if (args.length > 1) {
      this.scale = parseInt(args[1]);
    }

    this.test = function (str) {
      if (this.plus == 0) {
        var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      } else if (this.minus == 0) {
        var re = /^\s*(-)((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      } else {
        var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
        if (!re.test(str)) {
          return FORMAT_ERROR;
        }
      }

      var idx = str.indexOf('.');
      var maxlen = idx == -1 ? this.precision : this.precision + 1;
      maxlen = this.plus == 0 || this.minus == 0 ? maxlen + 1 : maxlen;
      if (str.length > maxlen) {
        return FORMAT_ERROR;
      }

      if (idx != -1 && this.scale) {
        var s = str.substring(idx + 1);
        if (s.length > this.scale) {
          return FORMAT_ERROR;
        }
      }
      return NO_ERRORS;
    }
  },

  Mail: function () {
    this.test = function (str) {
      var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Phone: function () {
    this.test = function (str) {
      var re = /^\d{11}$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Mobile: function () {
    this.test = function (str) {
      var re = /^\d{11}$/i;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Date: function () {
    this.test = function (str) {
      var re = /^\d{4}-\d{1,2}-\d{1,2}$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  Time: function () {
    this.test = function (str) {
      var re = /^\d{1,2}:\d{1,2}(:\d{1,2})?$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      str = "1970-01-01 " + str;
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  DateTime: function () {
    this.test = function (str) {
      var re = /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}(:\d{1,2})?$/;
      if (!re.test(str)) {
        return FORMAT_ERROR;
      }
      if (isNaN(Date.parse(str))) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  },

  RegExp: function (expr) {
    this.re = new RegExp(expr);
    this.test = function (str) {
      if (!this.re.test(str)) {
        return FORMAT_ERROR;
      }
      return NO_ERRORS;
    }
  },

  CmpExp: function (type, expr) {
    this.model = new ValidationModel(type);
    this.expr = expr;
    this.ignore = false;
    var self = this;
    this.test = function (str) {
      var expr = this.expr;
      var dt = Validation.getDomainValidator(this.model);
      if (dt.test(str) != NO_ERRORS) {
        return FORMAT_ERROR;
      }
      $('input[type!=checkbox][type!=radio][type!=button]').each(function (idx, el) {
        var name = $(el).attr('name');
        var val = $(el).val();
        if (expr.indexOf(name) != -1) {
          if (val == '') {
            self.ignore = true;
          }
          expr = expr.replace(new RegExp(name, 'g'), val);
        }
      });
      if (!this.ignore) {
        try {
          if (!eval(expr)) {
            return INVALID_ERROR;
          }
        } catch (e) {
          return INVALID_ERROR;
        }
      }
      return NO_ERRORS;
    }
  },

  Remote: function (uri) {
    this.test = function (str) {
      $.ajax({
        url: uri + str,
        dataType: "json",
        success: function (resp) {
          if (resp.error != 0) {

          }
        }
      });
    }
  },

  Range: function (opts, args) {
    this.min = parseFloat(args[0]);
    this.max = parseFloat(args[1]);
    this.test = function (str) {
      var check = parseFloat(str.trim());
      if (isNaN(check)) {
        return INVALID_ERROR;
      }
      var ret = false;
      if (opts[0] == ">") {
        ret = (check > this.min);
      } else if (opts[0] === ">=") {
        ret = (check >= this.min);
      }
      if (!ret) {
        return INVALID_ERROR;
      }
      if (opts[1] == "<") {
        ret = (check < this.max);
      } else if (opts[1] === "<=") {
        ret = (check <= this.max);
      }
      if (!ret) {
        return INVALID_ERROR;
      }
      return NO_ERRORS;
    }
  }
};

ValidationModel = function (expr) {
  this.symbol = '';
  this.keyword = '';
  this.opts = [];
  this.args = [];

  this.unary_ops = {
    '+': true,
    '-': true
  };

  this.keywords = {
    'string': true,
    'number': true,
    'range': true,
    'regexp': true,
    'mobile': true,
    'email': true,
    'phone': true,
    'cmpexp': true
  };
  var index = 0;
  var length = expr.length;
  var word = '';
  while (index < length) {
    var ch = expr.charAt(index);
    if (this.isUnaryOp(ch) && index == 0) {
      this.symbol = ch;
    } else if (ch == '[') {
      if (this.keyword != '') {
        word += ch;
      } else {
        if (!this.stringEqual('range', word)) {
          throw new Error('"[" is just available for range.');
        }
        this.keyword = word;
        this.opts.push('>=');
        word = '';
      }
    } else if (ch == '(') {
      if (this.keyword != '') {
        this.opts.push('(');
        word += ch;
      } else {
        this.keyword = word;
        this.opts.push(">");
        word = '';
      }
    } else if (ch == ']') {
      this.opts.push("<=")
      this.args.push(word);
      word = '';
    } else if (ch == ')' && index == length - 1) {
      this.args.push(word);
      this.opts.push('<');
      word = '';
    } else if (ch == ')') {
      this.opts.pop('<');
      if (this.opts.length == 1) {
        word += ch;
      }
    } else if (ch == ',') {
      if (this.opts.length == 1) {
        this.args.push(word);
        word = '';
      } else {
        word += ch;
      }
    } else {
      word += ch;
    }
    index++;
  }
  if (this.keyword == '') {
    this.keyword = word;
  }
};

ValidationModel.prototype = {

  isKeyword: function (str) {
    return this.keywords[str.toLowerCase()];
  },

  isUnaryOp: function (ch) {
    return this.unary_ops[ch];
  },

  isDecimalDigit: function (ch) {
    return (ch >= 48 && ch <= 57); // 0...9
  },

  isIdentifierStart: function (ch) {
    return (ch === 36) || (ch === 95) || // `$` and `_`
      (ch >= 65 && ch <= 90) || // A...Z
      (ch >= 97 && ch <= 122); // a...z
  },

  isIdentifierPart: function (ch) {
    return (ch === 36) || (ch === 95) || // `$` and `_`
      (ch >= 65 && ch <= 90) || // A...Z
      (ch >= 97 && ch <= 122) || // a...z
      (ch >= 48 && ch <= 57); // 0...9
  },

  stringEqual: function (str0, str1) {
    return str0.toLowerCase() === str1.toLowerCase();
  }
};

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

/*!
** 构造函数，配置项包括：
*/
function Calendar(opt) {
  opt = opt || {};
  this.today = moment(new Date());
  this.currentMonth = moment(this.today).startOf('month');
  this.currentIndex = 1;
  /*!
  ** 自定义渲染日期单元格。
  */
  this.doRenderDate = opt.doRenderDate || function(date) {};
  /*!
  ** 点击选择日期后的回调函数。
  */
  this.didSelectDate = opt.didSelectDate || function(date) {};
}

Calendar.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="gx calendar">
      <div class="title"></div>
      <div class="weekdays" style="position: sticky; top: 0;z-index: 10;">
        <div class="weekday">日</div>
        <div class="weekday">一</div>
        <div class="weekday">二</div>
        <div class="weekday">三</div>
        <div class="weekday">四</div>
        <div class="weekday">五</div>
        <div class="weekday">六</div>
      </div>
      <div class="swiper">
        <div class="swiper-wrapper">
          <div class="prev swiper-slide"></div>
          <div class="curr swiper-slide"></div>
          <div class="next swiper-slide"></div>
        </div>
      </div>
    </div>
  `, {});

  this.widgetSwiper = dom.find('.swiper', ret);
  this.title = dom.find('.title', ret);
  let prev = dom.find('.prev', ret);
  let curr = dom.find('.curr', ret);
  let next = dom.find('.next', ret);

  this.renderMonth(prev, moment(this.currentMonth).subtract(1,'months').startOf('month'));
  this.renderMonth(curr, this.currentMonth);
  this.renderMonth(next, moment(this.currentMonth).add(1,'months').startOf('month'));

  let swiper = new Swiper(this.widgetSwiper, {
    speed: 400,
    initialSlide: this.currentIndex,
    loop: true,
  });

  swiper.on('slideChange', ev => {
    if (ev.realIndex == 0) {
      if (this.currentIndex == 1) {
        this.currentMonth = moment(this.currentMonth).subtract(1, 'months');
      } else if (this.currentIndex == 2) {
        this.currentMonth = moment(this.currentMonth).add(1, 'months');
      }
    } else if (ev.realIndex == 1) {
      if (this.currentIndex == 0) {
        this.currentMonth = moment(this.currentMonth).add(1, 'months');
      } else if (this.currentIndex == 2) {
        this.currentMonth = moment(this.currentMonth).subtract(1, 'months');
      }
    } else if (ev.realIndex == 2) {
      if (this.currentIndex == 0) {
        this.currentMonth = moment(this.currentMonth).subtract(1, 'months');
      } else if (this.currentIndex == 1) {
        this.currentMonth = moment(this.currentMonth).add(1, 'months');
      }
    }
    this.currentIndex = ev.realIndex;
    let prevMonth = moment(this.currentMonth).subtract(1, 'months');
    let nextMonth = moment(this.currentMonth).add(1, 'months');

    let elPrev = null;
    let elNext = null;
    if (this.currentIndex == 0) {
      elPrev = ret.querySelectorAll('.next');
      elNext = ret.querySelectorAll('.curr');
    } else if (this.currentIndex == 1) {
      elPrev = ret.querySelectorAll('.prev');
      elNext = ret.querySelectorAll('.next');
    } else if (this.currentIndex == 2) {
      elPrev = ret.querySelectorAll('.curr');
      elNext = ret.querySelectorAll('.prev');
    }

    for (let i = 0; i < elPrev.length; i++) {
      this.renderMonth(elPrev[i], prevMonth);
    }
    for (let i = 0; i < elNext.length; i++) {
      this.renderMonth(elNext[i], nextMonth);
    }
  });

  return ret;
};

Calendar.prototype.renderMonth = function(container, month) {
  let weekday = month.startOf('month').day();
  let days = month.daysInMonth();
  container.innerHTML = '';
  let row = null;
  for (let i = 0; i < days + weekday; i++) {
    if (i % 7 == 0) {
      row = dom.create('div', 'dates');
    }
    let date = dom.element(`<div class="date"></div>`);
    let day = (i - weekday + 1);
    if (i >= weekday) {
      let datespan = dom.element(`<div></div>`);
      datespan.innerText = day;
      date.appendChild(datespan);
    }
    let dateVal = month.format('YYYY-MM-') + (day < 10 ? ('0' + day) : day);
    if (dateVal == this.today.format('YYYY-MM-DD')) {
      date.classList.add('today');
    }
    
    date.setAttribute('data-calendar-date', dateVal);
    row.appendChild(date);
    date.onclick = ev => {
      this.doSelectDate(ev);
    };

    if (i % 7 == 6) {
      container.appendChild(row);
      row = null;
    }
  }
  if (row != null) {
    container.appendChild(row);
  }
  // 补足下月的空白
  let residue = 7 - (days + weekday) % 7;
  for (let i = 0; i < residue; i++) {
    let date = dom.element(`<div class="date"></div>`);
    container.appendChild(date);
  }

  // 显示月份
  this.title.innerText = this.currentMonth.format('YYYY年MM月');
};

Calendar.prototype.stylizeDates = function (style, startDate, endDate) {
  let dates = dom.find('.dates.curr', this.root);
  if (Array.isArray(startDate)) {
    for (let i = 0; i < startDate.length; i++) {
      for (let j = 0; j < dates.children.length; j++) {
        if (moment(startDate[i]).format('YYYY-MM-DD') == dates.children[j].getAttribute('data-calendar-date')) {
          dates.children[j].style = style;
          break;
        }
      }
    }
    return;
  }
  startDate = moment(startDate).format('YYYY-MM-DD');
  endDate = moment(endDate).format('YYYY-MM-DD');
  for (let j = 0; j < dates.children.length; j++) {
    let date = dates.children[j].getAttribute('data-calendar-date');
    if (date >= startDate && date <= endDate ) {
      dates.children[j].style = style;
    }
  }
};

Calendar.prototype.render = function(containerId, params) {
  this.root = this.root();
  let container = dom.find(containerId);
  container.innerHTML = '';
  container.appendChild(this.root);
};

Calendar.prototype.doSelectDate = function (ev) {
  this.root.querySelectorAll('div.selected').forEach((elm, idx) => {
    elm.classList.remove('selected');
  });
  let div = dom.ancestor(ev.target, 'div', 'date');
  div.classList.add('selected');
};

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function CascadePicker(opt) {
  this.success = opt.success || function (vals) {};
  this.selections = opt.selections || {};
  this.levels = opt.levels;
}

CascadePicker.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="gx popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom district-picker">
        <div class="popup-title">
          <button class="clear">清除</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="cancel">取消</button>
          <button class="confirm">确认</button>
        </div>
        <div>
          <div widget-id="widgetLevel" style="padding: 4px 16px">
          </div>
          <div style="border-top: 1px solid var(--color-divider);"></div>
          <ul widget-id="widgetValue" class="list-group" style="height: 240px; overflow-y: auto;">
          </ul>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  this.widgetLevel = dom.find('[widget-id=widgetLevel]', ret);
  this.widgetValue = dom.find('[widget-id=widgetValue]', ret);

  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let clear = dom.find('.clear', ret);

  let onSelectionClicked = ev => {
    let div = dom.ancestor(ev.target, 'div');
    let strong = dom.find('strong', div);
    let level = parseInt(strong.getAttribute('data-cascade-level'));
    let value = strong.getAttribute('data-cascade-value');
    let name = strong.getAttribute('data-cascade-name');
    let params = null;

    let  elPrev = dom.find('[data-cascade-level="' + (level - 1) + '"]', this.widgetLevel);
    if (elPrev != null) {
      let prevValue = elPrev.getAttribute('data-cascade-value');
      let prevName = elPrev.getAttribute('data-cascade-name');
      params = {};
      params[prevName] = prevValue;
    }
    this.renderValue(level, params);

    for (let i = level + 1; i < this.levels.length; i++) {
      let  elNext = dom.find('[data-cascade-level="' + i + '"]', this.widgetLevel);
      elNext.setAttribute('data-cascade-value', '');
      elNext.innerText = this.levels[i].placeholder;
    }
  }

  for (let i = 0; i < this.levels.length; i++) {
    let el = dom.templatize(`
      <div class="d-flex" style="line-height: 40px;">
        <strong data-cascade-level="${i}" data-cascade-name="{{name}}" class="font-16">{{placeholder}}</strong>
        <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
      </div>
    `, this.levels[i]);
    this.widgetLevel.appendChild(el);

    dom.bind(el, 'click', ev => {
      onSelectionClicked(ev);
    });
  }

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(clear, 'click', ev => {
    this.success([]);
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    let strongs = dom.find('strong', this.widgetLevel);
    let vals = {};
    for (let i = 0; i < strongs.length; i++) {
      let strong = strongs[i];
      let model = dom.model(strong);
      vals[strong.getAttribute('data-cascade-name')] = model;
    }
    this.success(vals);
    this.close();
  });

  setTimeout(() => {
    this.bottom.classList.add('in');
  }, 50);
  return ret;
};

CascadePicker.prototype.renderValue = async function(level, params, selected) {
  let elLevel = dom.find('[data-cascade-level="' + level + '"]', this.widgetLevel);
  if (elLevel == null) {
    return;
  }
  let optLevel = this.levels[level];
  this.widgetValue.innerHTML = '';

  if (!optLevel.url) {
    return;
  }
  if (typeof optLevel.params === 'function') {
    params = optLevel.params(params);
  } else {
    params = optLevel.params;
  }
  let rows = await xhr.promise({
    url: optLevel.url,
    params: params,
  });
  for (let i = 0; i < rows.length; i++) {
    let data = {
      value: rows[i][optLevel.fields.value],
      text: rows[i][optLevel.fields.text],
    };
    let el = dom.templatize(`
      <li class="list-group-item" data-cascade-value="{{value}}">{{text}}</li>
    `, data);
    dom.model(el, rows[i]);
    dom.bind(el, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let model = dom.model(li);
      elLevel.innerText = model[optLevel.fields.text];
      elLevel.setAttribute('data-cascade-value', model[optLevel.fields.value]);
      dom.model(elLevel, model);
      let newParams = {};
      newParams[optLevel.fields.value] = model[optLevel.fields.value];
      this.renderValue(level + 1, newParams, model);
    });
    this.widgetValue.appendChild(el);
  }
};

CascadePicker.prototype.show = function(container) {
  container.appendChild(this.root());
  this.renderValue(0);
};

CascadePicker.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function DistrictPicker(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (vals) {};
  this.selections = opt.selections || {};
}

DistrictPicker.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="gx popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom district-picker">
        <div class="popup-title">
          <button class="clear">清除</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="cancel">取消</button>
          <button class="confirm">确认</button>
        </div>
        <div class="bottom-dialog-body">
          <div style="padding: 4px 16px">
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetProvince" class="font-16">选择省份</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetCity" class="font-16">选择城市</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetCounty" class="font-16">选择区县</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
            <div class="d-flex" style="line-height: 40px;">
              <strong widget-id="widgetTown" class="font-16">选择街道/乡镇</strong>
              <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
            </div>
          </div>
          <div style="border-top: 1px solid var(--color-divider);"></div>
          <ul widget-id="widgetDistrict" class="list-group" style="height: 240px; overflow-y: auto;">
          </ul>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  this.district = dom.find('[widget-id=widgetDistrict]', ret);
  this.province = dom.find('[widget-id=widgetProvince]', ret);
  this.city = dom.find('[widget-id=widgetCity]', ret);
  this.county = dom.find('[widget-id=widgetCounty]', ret);
  this.town = dom.find('[widget-id=widgetTown]', ret);

  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let clear = dom.find('.clear', ret);
  let value = dom.find('.value', ret);

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(clear, 'click', ev => {
    this.success({});
    this.close();
  });

  if (this.selections.province) {
    this.province.setAttribute('data-model-chinese-district-code', this.selections.province.chineseDistrictCode);
    this.province.innerText = this.selections.province.chineseDistrictName;
  }
  if (this.selections.city) {
    this.city.setAttribute('data-model-chinese-district-code', this.selections.city.chineseDistrictCode);
    this.city.innerText = this.selections.city.chineseDistrictName;
  }
  if (this.selections.county) {
    this.county.setAttribute('data-model-chinese-district-code', this.selections.county.chineseDistrictCode);
    this.county.innerText = this.selections.county.chineseDistrictName;
  }
  if (this.selections.town) {
    this.town.setAttribute('data-model-chinese-district-code', this.selections.town.chineseDistrictCode);
    this.town.innerText = this.selections.town.chineseDistrictName;
  }

  dom.bind(confirm, 'click', ev => {
    let vals = {};
    let provinceCode = this.province.getAttribute('data-model-chinese-district-code');
    let cityCode = this.city.getAttribute('data-model-chinese-district-code');
    let countyCode = this.county.getAttribute('data-model-chinese-district-code');
    let townCode = this.town.getAttribute('data-model-chinese-district-code');
    if (provinceCode != '') {
      vals.province = {chineseDistrictCode: provinceCode, chineseDistrictName: this.province.innerText,};
    }
    if (cityCode != '') {
      vals.city = {chineseDistrictCode: cityCode, chineseDistrictName: this.city.innerText,};
    }
    if (countyCode != '') {
      vals.county = {chineseDistrictCode: countyCode, chineseDistrictName: this.county.innerText,};
    }
    if (townCode != '') {
      vals.town = {chineseDistrictCode: townCode, chineseDistrictName: this.town.innerText,};
    }
    this.success(vals);
    this.close();
  });

  let onSelectionClicked = ev => {
    let div = dom.ancestor(ev.target, 'div');
    let strong = dom.find('strong', div);
    let chineseDistrictCode = strong.getAttribute('data-model-chinese-district-code');
    if (chineseDistrictCode.length == 9) {
      this.renderDistrict(chineseDistrictCode.substr(0, 6));
    } else {
      this.renderDistrict(chineseDistrictCode.substr(0, chineseDistrictCode.length - 2));
    }
  }

  dom.bind(this.province.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.city.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.county.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });
  dom.bind(this.town.parentElement, 'click', ev => {
    onSelectionClicked(ev);
  });

  setTimeout(() => {
    this.bottom.classList.add('in');
  }, 50);
  return ret;
};

DistrictPicker.prototype.renderDistrict = async function(districtCode) {
  let andCondition = null;
  let elDistrict = null;
  if (!districtCode) {
    andCondition = `
      and length(chndistcd) = 2
    `;
    elDistrict = this.province;
    this.city.setAttribute('data-model-chinese-district-code', '');
    this.city.innerText = '选择城市';
    this.county.setAttribute('data-model-chinese-district-code', '');
    this.county.innerText = '选择区县';
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 2) {
    andCondition = `
      and length(chndistcd) = 4 and substring(chndistcd, 1, 2) = '${districtCode}'
    `;
    elDistrict = this.city;
    this.county.setAttribute('data-model-chinese-district-code', '');
    this.county.innerText = '选择区县';
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 4) {
    andCondition = `
      and length(chndistcd) = 6 and substring(chndistcd, 1, 4) = '${districtCode}'
    `;
    elDistrict = this.county;
    this.town.setAttribute('data-model-chinese-district-code', '');
    this.town.innerText = '选择街道/乡镇';
  } else if (districtCode.length == 6) {
    andCondition = `
      and length(chndistcd) = 9 and substring(chndistcd, 1, 6) = '${districtCode}'
    `;
    elDistrict = this.town;
  } else {
    return;
  }
  let districts = await xhr.promise({
    url: "/api/v3/common/script/stdbiz/gb/chinese_district/find",
    params: {
      _and_condition: andCondition,
      _order_by: 'convert(chndistnm using gbk) asc',
    },
  });
  this.district.innerHTML = '';
  for (let i = 0; i < districts.length; i++) {
    let district = districts[i];
    let el = dom.templatize(`
      <li class="list-group-item">{{chineseDistrictName}}</li>
    `, district);
    dom.model(el, district);
    dom.bind(el, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let model = dom.model(li);
      elDistrict.innerText = model.chineseDistrictName;
      elDistrict.setAttribute('data-model-chinese-district-code', model.chineseDistrictCode);
      this.renderDistrict(model.chineseDistrictCode);
    });
    this.district.appendChild(el);
  }
};

DistrictPicker.prototype.show = function(container) {
  container.appendChild(this.root());
  this.renderDistrict();
};

DistrictPicker.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};
/**
 * Encapsulates all functions of list view container.
 * <p>
 * And the functions are listed below:
 *
 * 1. RELOAD a list
 * 2. ADD an item to a list
 * 3. REMOVE an item from a list
 * 4. CHANGE an item in a list
 * 5. REORDER items in a list
 * 6. LOAD more items into a list
 * 7. CHECK an item in a list
 * 8. SELECT an item in a list
 */
function ListView(opt) {
  // the remote data source
  this.url = opt.url;
  this.usecase = opt.usecase;
  this.params = opt.params || {};
  // 懒加载标志，通常用于多级联动时的次级列表，不主动加载
  this.lazy = opt.lazy === true;
  this.hoverable = opt.hoverable !== false;
  this.activateable = opt.activateable === true;
  this.itemClass = opt.itemClass || [];
  this.slidingActions = opt.slidingActions || [];

  this.emptyHtml = opt.emptyHtml || `
    <div class="d-flex flex-wrap mt-2">
      <img class="m-auto" src="/img/app/no-data.png" width="60%">
      <div style="flex-basis: 100%; height: 0;"></div>
      <div class="text-muted m-auto mt-2" style="font-weight: bold;">没有任何数据</div>
    </div>
  `;
  this.idField = opt.idField;

  /*!
  ** 用于比较用的标识字段。
  */
  this.compare = opt.compare || function(selection, row) {return false;};
  this.selections = opt.selections || [];
  this.local = opt.local || [];
  /*!
  ** 创建Tile元素。
  */
  this.create = opt.doCreate || function(idx, row) {};
  this.complete = opt.complete;

  this.draggable = opt.draggable === true;

  this.start = opt.start || 0;
  this.limit = opt.limit || -1;

  this.borderless = opt.borderless || false;
  this.height = opt.height;
  this.tooltip = opt.tooltip;
  this.required = opt.required || false;
  // event callback
  this.onRemove = opt.doRemove;
  this.onReorder = opt.doReorder;
  this.onCheck = opt.doCheck;
  this.onSelect = opt.doSelect;
  this.onFilter = opt.doFilter;
  this.onAdd = opt.doAdd;
  this.onSearch = opt.doSearch;
  this.onClick = opt.doClick;

  // this.observableItems = new rxjs.Observable();
};

/**
 * Fetch data from remote data source.
 */
ListView.prototype.fetch = async function (params) {
  let requestParams = {};
  params = params || {};
  util.clone(this.params, requestParams);
  util.clone(params, requestParams);
  let self = this;
  if (this.url) {
    this.data = this.data || {};
    this.data.start = this.start;
    this.data.limit = this.limit;

    let data = await xhr.promise({
      url: this.url,
      params: requestParams,
    });
    Array.prototype.push.apply(self.local, data);
  }
  if (self.local.length == 0) {
    if (this.emptyHtml) {
      this.contentContainer.innerHTML = this.emptyHtml;
    }
  } else {
    self.append(this.local);
  }
};

/**
 * Renders a list view under its container.
 */
ListView.prototype.render = function(containerId, loading) {
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = containerId;
  this.container.innerHTML = '';
  let ulHeight = this.height - 37;
  // style="height: 120px; overflow-y: auto; border: 1px solid rgba(0, 0, 0, 0.125); border-top: none;"
  if (this.onFilter) {
    let topbar = dom.element(`
      <div class="input-group position-sticky" style="top: 0; left: 0; z-index: 10;">
        <div class="input-group-prepend">
          <span class="input-group-text" style="border-bottom-left-radius: unset;">
            <i class="fas fa-search"></i>
          </span>
        </div>
        <input class="form-control" placeholder="搜索..."  style="border-bottom-right-radius: unset;">
        <div class="input-group-append">
          <span class="input-group-text pointer text-primary" style="border-bottom-right-radius: unset;">
            <i class="fas fa-plus"></i>
          </span>
          <span class="input-group-text" style="border-bottom-right-radius: unset;">
            <i class="fas fa-question icon-general"></i>
          </span>
          <span class="input-group-text" style="border-bottom-right-radius: unset;">
            <i class="fas fa-asterisk icon-required"></i>
          </span>
        </div>
      </div>
    `);
    let input = dom.find('input', topbar);
    dom.bind(input, 'input', ev => {
      clearTimeout(this.delayToSearch);
      this.delayToSearch = setTimeout(() => {
        this.onFilter(this, input.value);
      }, 500);
    });
    if (!this.required) {
      topbar.children[2].children[2].remove();
    }
    if (!this.tooltip) {
      topbar.children[2].children[1].remove();
    }
    if (!this.onAdd) {
      topbar.children[2].children[0].remove();
    }
    if (topbar.children[2].children.length == 0) {
      topbar.children[2].remove();
    }
    this.container.appendChild(topbar);
  }

  this.contentContainer = dom.create('div', 'full-width');
  let ul = dom.create('ul', 'list-group', 'full-width', 'overflow-hidden');
  if (this.borderless) {
    ul.classList.add('b-a-0');
  }
  if (this.onFilter) {
    let ulContainer = dom.create('div');
    ulContainer.style.height = ulHeight + 'px';
    ulContainer.style.overflowY = 'auto';
    // ulContainer.style.border = '1px solid rgba(0, 0, 0, 0.125)';
    ulContainer.style.borderTop = '';
    ulContainer.appendChild(ul);
    this.contentContainer.appendChild(ulContainer);
  } else {
    this.contentContainer.appendChild(ul);
  }
  this.container.appendChild(this.contentContainer);

  if (loading !== false && this.lazy !== true)
    this.reload();
};

/**
 * Reloads list items into a list.
 */
ListView.prototype.reload = function(params) {
  params = params || {};
  let ul = dom.find('ul', this.container);
  ul.innerHTML = '';

  this.start = 0;
  // 如果指定了远程链接，则本地数据无效
  if (this.url)
    this.local = [];
  this.fetch(params);
};

/**
 * Loads more list items into a list.
 */
ListView.prototype.load = function() {
  this.start = this.local.length;
  this.fetch();
};

ListView.prototype.remove = function(model) {
  if (this.idField) {
    let ul = dom.find('ul', this.container);
    for (let i = 0; i < ul.children.length; i++) {
      let child = ul.children[i];
      let childModel = dom.model(child);
      if (childModel[this.idField] === model[this.idField]) {
        child.remove();
      }
    }
  }
};

/**
 * Appends list item dom element(s) with the given data to list view.
 *
 * @param {any} data
 *        an array or object
 *
 * @private
 */
ListView.prototype.append = function(data, index) {
  let self = this;
  let ul = this.container.querySelector('ul');
  if (ul == null) {
    this.container.innerHTML = '';
    ul = dom.create('ul', 'list-group', 'full-width');
    this.container.appendChild(ul);
  }
  let len = ul.querySelectorAll('li').length;

  if (Array.isArray(data)) {
    let rows = data;
    for (let i = 0; i < rows.length; i++) {
      this.append(rows[i]);
    }
    if (self.complete) {
      self.complete(data);
    }
  } else {
    let row = data;
    // check duplicated
    if (this.idField) {
      for (let i = 0; i < ul.children.length; i++) {
        let child = ul.children[i];
        let childModel = dom.model(child);
        if (childModel[this.idField] === row[this.idField]) {
          return;
        }
      }
    }

    let li = dom.create('li', 'list-group-item');
    if (this.hoverable !== false) {
      li.classList.add('list-group-item-action');
    }
    if (this.activateable === true) {
      dom.bind(li, 'click', ev => {
        for (let i = 0; i < li.parentElement.children.length; i++) {
          let el = li.parentElement.children[i];
          el.classList.remove('active');
        }
        li.classList.add('active');
      });
    }
    for (let i = 0; i < this.itemClass.length; i++) {
      li.classList.add(this.itemClass[i]);
    }
    if (this.borderless) {
      li.classList.add('b-a-0');
    }
    if (this.onClick) {
      dom.bind(li, 'click', this.onClick);
    }
    li.style.paddingLeft = '16px';
    li.style.paddingRight = '16px';
    li.style.paddingTop = '8px';
    li.style.paddingBottom = '8px';
    li.style.display = 'flex';
    li.style.alignItems = 'center';

    if (this.onFilter) {
      li.style.borderLeftWidth = '0';
      li.style.borderRightWidth = '0';
      li.style.borderBottomWidth = '0';
    }

    let div = this.create(len, row, li);
    div.style.width = '100%';

    if (this.onCheck) {
      let input = dom.element(`
        <input class="pointer checkbox color-info is-outline mr-2" type="checkbox">
      `);
      for (let i = 0; i < this.selections.length; i++) {
        if (this.compare(this.selections[i], row)) {
          input.setAttribute('checked', true);
          break;
        }
      }
      dom.bind(input, 'change', function() {
        self.onCheck(this.checked, dom.model(this), this);
      });
      dom.model(input, row);
      li.appendChild(input);
    }
    li.appendChild(div);

    if (this.slidingActions.length > 0) {
      this.actionElements = [];
      for (let i = 0; i < this.slidingActions.length; i++) {
        let slidingAction = this.slidingActions[i];
        slidingAction.width = parseInt(slidingAction.width || 64);
        li.appendChild(slidingAction.create());
      }
      dom.bind(li, 'touchstart', ev => {
        this.touchStartX = ev.touches[0].screenX;
        this.touchStartY = ev.touches[0].screenY;
      });
      dom.bind(li, 'touchmove', ev => {
        this.touchMoveX = ev.touches[0].screenX;
        this.touchMoveY = ev.touches[0].screenY;
        let distanceX = this.touchStartX - this.touchMoveX;
        let distanceY = this.touchStartY - this.touchMoveY;
        if (Math.abs(distanceX) < 30) return;
        if (Math.abs(distanceY) > 30) return;
        if (distanceX > 0) {
          let avg = distanceX / this.slidingActions.length;
          for (let j = 1; j < li.children.length; j++) {
            let rect = li.children[j].getBoundingClientRect();
            if (rect.width >= this.slidingActions[j - 1].width) {
              continue;
            }
            if (avg >= this.slidingActions[j - 1].width) avg = this.slidingActions[j - 1].width;
            li.children[j].style.minWidth = avg + 'px';
            li.children[j].style.display = '';
          }
        } else {
          distanceX = -distanceX / 10;
          let avg = distanceX / this.slidingActions.length;
          for (let j = 1; j < li.children.length; j++) {
            let rect = li.children[j].getBoundingClientRect();
            let width = rect.width - avg;
            width = width <= 5 ? 0 : width;
            if (width == 0) {
              li.children[j].style.width = '0';
              li.children[j].style.minWidth = 'unset';
            } else {
              li.children[j].style.minWidth = width + 'px';
            }
          }
        }
      });
      dom.bind(li, 'touchend', ev => {
        this.touchendX = ev.changedTouches[0].screenX;
        this.touchendY = ev.changedTouches[0].screenY;
        let distanceX = this.touchStartX - this.touchendX;
        let distanceY = this.touchStartY - this.touchendY;
        if (Math.abs(distanceX) < 30) return;
        if (Math.abs(distanceY) > 30) return;
        if (distanceX >= 30) {
          this.expandSlidingActions(li);
        } else if (distanceX <= -30) {
          this.collapseSlidingActions(li);
        } else {
          this.collapseSlidingActions(li);
        }
      });
    }

    if (this.idField) {
      li.setAttribute("data-list-item-id", row[this.idField])
    }
    dom.model(li, row);

    if (typeof index === 'number') {
      if (index < 0) {
        ul.insertBefore(li, ul.children[ul.children.length + index]);
      } else {
        ul.insertBefore(li, ul.children[index]);
      }
    } else {
      ul.appendChild(li);
    }

    if (this.onRemove) {
      let link = dom.element(`
        <a class="btn text-danger float-right font-18" style="padding: 0; margin-left: auto;">
          <i class="fas fa-times" style=""></i>
        </a>
      `);
      dom.bind(link, 'click', function(ev) {
        ev.stopPropagation();
        self.onRemove(this.parentElement, dom.model(this.parentElement));
      });
      dom.model(link, row);
      li.appendChild(link);
    }

    if (this.onReorder)
      this.setReorderable(li);
    else if (this.draggable) {
      li.setAttribute("draggable", "true");
      li.addEventListener('dragover', function (event) {
        event.preventDefault();
      });
      li.addEventListener("dragstart", function(event) {

      });
    }
  }
};

ListView.prototype.setLocal = function(data) {
  if (!data || data.length == 0) {
    this.contentContainer.innerHTML = '';
    if (this.emptyHtml) {
      this.contentContainer.innerHTML = this.emptyHtml;
    }
    return;
  } else {
    this.contentContainer.innerHTML = '';
  }
  let ul = dom.find('ul', this.contentContainer);
  if (ul == null) {
    let ul = dom.create('ul', 'list-group', 'full-width');
    if (this.borderless) {
      ul.classList.add('b-a-0');
    }
    let ulContainer = dom.create('div');
    let ulHeight = this.height - 37;
    ulContainer.style.height = ulHeight + 'px';
    ulContainer.style.overflowY = 'auto';
    // ulContainer.style.border = '1px solid rgba(0, 0, 0, 0.125)';
    ulContainer.style.borderTop = '';
    ulContainer.appendChild(ul);
    this.contentContainer.appendChild(ulContainer);
  } else {
    ul.innerHTML = '';
  }
  for (let row of data) {
    this.append(row);
  }
};

ListView.prototype.replace = function(data) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    let li = ul.children[i];
    let model = dom.model(li);
    if (model[this.idField] === data[this.idField]) {
      dom.model(li, data);
      li.innerHTML = '';
      li.appendChild(this.create(i, data));
      break;
    }
  }
};

ListView.prototype.search = function(query) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    let li = ul.children[i];
    if (li.innerText.indexOf(query) != -1) {
      li.style.display = '';
    } else {
      li.style.display = 'none';
    }
  }
};

ListView.prototype.setReorderable = function(li) {
  let ul = dom.find('ul', this.container);

  ul.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
  ul.ondrop = event => {
    if (this.onReorder) {
      this.onReorder(dom.model(this.draggingElement), this.getItemIndex(this.draggingElement),
        this.draggingElementOriginalIndex);
    }
    this.draggingElement.style.opacity = '';
    this.draggingElement = null;
    this.clonedDraggingElement = null;
  };

  li.setAttribute("draggable", "true");
  li.ondragover = event => {
    let li = dom.ancestor(event.target, 'li');
    let ul = li.parentElement;
    if (li == this.draggingElement) {
      return;
    }

    let liIndex = this.getItemIndex(li);
    if (liIndex < this.draggingElementIndex) {
      ul.insertBefore(this.draggingElement, li);
    } else if (liIndex > this.draggingElementIndex) {
      if (li.nextElementSibling == null) {
        ul.appendChild(this.draggingElement);
      } else {
        ul.insertBefore(this.draggingElement, li.nextElementSibling);
      }
    }

    this.draggingElementIndex = liIndex;
    event.preventDefault();
  };
  li.ondragstart = event => {
    let li = dom.ancestor(event.target, 'li');
    let ul = li.parentElement;
    let x = event.layerX;
    let y = event.layerY;
    let target = event.target;
    y = target.offsetTop + y;

    this.clonedDraggingElement = li.cloneNode(true);

    this.draggingElement = li;
    this.draggingElement.style.opacity = "0.3";
    this.draggingElementIndex = this.getItemIndex(li);
    this.draggingElementOriginalIndex = this.draggingElementIndex;

    event.dataTransfer.setData("id", li.getAttribute('data-list-item-id'));
    event.dataTransfer.setData("y", y);
  };
};

ListView.prototype.getItemIndex = function(li) {
  let ul = li.parentElement;
  for (let i = 0; i < ul.children.length; i++) {
    if (li == ul.children[i]) {
      return i;
    }
  }
};

ListView.prototype.setHeight = function(height) {
  let ul = this.container.querySelector('ul');
  ul.style.height = height + 'px';
};

ListView.prototype.activate = function(li) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    ul.children[i].classList.remove('active');
  }
  li.classList.add('active');
};

ListView.prototype.getCheckedValues = function () {
  if (!this.onCheck) return [];
  let checkboxes = this.container.querySelectorAll('input.checkbox');
  let ret = [];
  for (let checkbox of checkboxes) {
    if (checkbox.checked === true) {
      let li = dom.ancestor(checkbox, 'li');
      ret.push(dom.model(li));
    }
  }
  return ret;
};

ListView.prototype.expandSlidingActions = function (li) {
  let width = li.children[1].getBoundingClientRect().width;
  if (width >= this.slidingActions[0].width.width) return;
  let fun = (li) => {
    for (let i = 1; i < li.children.length; i++) {
      let action = li.children[i];
      let rect = action.getBoundingClientRect();
      if ((rect.width + 5) >= this.slidingActions[i - 1].width) {
        action.style.minWidth = this.slidingActions[i - 1].width + 'px';
        clearInterval(this.interval4SlidingActions);
        continue;
      };
      action.style.minWidth = (rect.width + 5) + 'px';
    }
  };
  this.interval4SlidingActions = setInterval(() => {
    fun(li);
  }, 5);
};

ListView.prototype.collapseSlidingActions = function (li) {
  let width = li.children[1].getBoundingClientRect().width;
  if (width <= 0) return;
  this.interval4SlidingActions = setInterval(() => {
    for (let i = 1; i < li.children.length; i++) {
      let action = li.children[i];
      let rect = action.getBoundingClientRect();
      if ((rect.width - 5) <= 0) {
        action.style.width = '0';
        action.style.minWidth = 'unset';
        action.style.display = 'none';
        clearInterval(this.interval4SlidingActions);
        continue;
      };
      action.style.minWidth = (rect.width - 5) + 'px';
    }
  }, 10);

};

ListView.prototype.subscribe = function(name, callback) {

};

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function Numpad(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (val) {};
  this.type = opt.type || 'decimal';
}

Numpad.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="gx popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom in">
        <div class="popup-title">
          <button class="clear">清除</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="cancel">取消</button>
          <button class="confirm">确认</button>
        </div>
        <div class="gx-d-flex gx-w-full gx numpad" style="flex-wrap: wrap!important;">
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">1</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">2</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">3</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">4</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">5</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">6</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">7</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">8</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">9</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button widget-id="buttonSpecial" class="number">.</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px;">
            <button class="number">0</button>
          </div>
          <div class="gx-24-08" style="line-height: 48px; font-size: 24px;">
            <button class="number">
              <i class="fas fa-backspace" style="font-size: 20px;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  // this.audio = new Audio('img/keypressed.wav');
  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let clear = dom.find('.clear', ret);
  let value = dom.find('.value', ret);
  let special = dom.find('[widget-id=buttonSpecial]', ret);

  if (this.type == 'id') {
    special.innerText = 'X';
    this.regex = /^.{0,18}$/;
  } else if (this.type == 'mobile') {
    special.remove();
    this.regex = /^.{0,11}$/;
  }

  let numbers = ret.querySelectorAll('.number');
  for (let i = 0; i < numbers.length; i++) {
    let num = numbers[i];
    dom.bind(num, 'click', ev => {
      let str = value.innerText;
      let text = ev.currentTarget.innerText;
      if (text == '') {
        if (str === '') return;
        str = str.substr(0, str.length - 1);
      } else {
        if (this.regex.test(str + text)) {
          str += text;
        }
      }
      value.innerText = str;
    });
    // dom.bind(num, 'touchstart', ev => {
    //   this.audio.src= 'img/keypressed.wav';
    //   this.audio.play();
    // });
    // dom.bind(num, 'touchend', ev => {
    //   // this.audio.pause();
    // });
  }

  dom.bind(mask, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.close();
  });

  dom.bind(clear, 'click', ev => {
    this.success('');
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    this.success(value.innerText);
    this.close();
  });
  return ret;
};

Numpad.prototype.show = function(container) {
  container.appendChild(this.root());
};

Numpad.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};

/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function PopupRuler(opt) {
  this.unit = opt.unit || '';
  this.regex = opt.regex || /.*/;
  this.success = opt.success || function (val) {};
  this.type = opt.type || 'decimal';
  this.value = opt.value || 0;
  this.range = opt.range;
}

PopupRuler.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="gx popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom in">
        <div class="popup-title">
          <button class="clear">清除</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="cancel">取消</button>
          <button class="confirm">确认</button>
        </div>
        <div class="popup-content" style="height: 200px; width: 100%;"></div>
      </div>
    </div>
  `, this);

  this.bottom = dom.find('.popup-bottom', ret);
  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);
  let clear = dom.find('.clear', ret);
  let value = dom.find('.value', ret);

  dom.bind(mask, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    this.close();
  });

  dom.bind(clear, 'click', ev => {
    this.success('');
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    this.success(value.innerText);
    this.close();
  });

  return ret;
};

PopupRuler.prototype.show = function(container) {
  let root = this.root();
  container.appendChild(root);

  let content = dom.find('.popup-content', root);
  let value = dom.find('.value', root);
  value.innerText = this.value || this.range[0];
  ruler.initPlugin({
    el: content, //容器id
    startValue: this.value || this.range[0],
    maxScale: this.range[1], //最大刻度
    region: [this.range[0], this.range[1]], //选择刻度的区间范围
    background: "#fff",
    color: "#E0E0E0", //刻度线和字体的颜色
    markColor: "#73B17B", //中心刻度标记颜色
    isConstant: true, //是否不断地获取值
    success: res => {
      value.innerText = res;
    }
  });
};

PopupRuler.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};

function SingleColumnForm(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
}

SingleColumnForm.prototype.render = async function (container) {
  container.innerHTML = '';
  let root = await this.root();
  container.appendChild(root);
};

SingleColumnForm.prototype.root = async function() {
  let ret = dom.element(`
    <div class="gx-form"></div>
  `);
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let el = null;
    if (field.input === 'date') {
      el = this.buildDate(field);
    } else if (field.input === 'time') {
      el = this.buildTime(field);
    } else if (field.input === 'bool') {
      el = this.buildSwitch(field);
    } else if (field.input === 'radio') {
      el = await this.buildRadio(field);
    } else if (field.input === 'check') {
      el = await this.buildCheck(field);
    } else if (field.input === 'select') {
      el = await this.buildSelect(field);
    } else if (field.input === 'hidden') {
      el = dom.templatize(`
        <input type="hidden" name="{{name}}">
      `, field);
    } else if (field.input === 'mobile') {
      el = this.buildMobile(field);
    } else if (field.input === 'id') {
      el = this.buildId(field);
    } else if (field.input === 'district') {
      el = this.buildDistrict(field);
    } else if (field.input === 'ruler') {
      el = this.buildRuler(field);
    } else if (field.input === 'segment') {
      el = this.buildSegment(field);
    } else if (field.input === 'images') {
      el = this.buildImages(field);
    } else if (field.input === 'longtext') {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-24">{{title}}</label>
          <div class="gx-24-24">
            <textarea type="text" name="{{name}}" class="gx-form-control" placeholder="请填写"></textarea>
          </div>
        </div>
      `, field);
      if (this.readonly === true) {
        dom.find('textarea', el).setAttribute('placeholder', '');
        dom.find('textarea', el).setAttribute('readonly', true);
      }
    } else if (field.input === 'icon') {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-24">{{title}}</label>
          <div class="gx-24-24"></div>
        </div>
      `, field);
      let input = field.create(field.value);
      el.children[1].appendChild(input);
    } else if (field.input === 'icons') {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-24">{{title}}</label>
          <div class="gx-24-24"></div>
        </div>
      `, field);
      let input = field.create(field.value);
      el.children[1].appendChild(input);
    } else if (field.input === 'rating') {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-24">{{title}}</label>
          <div class="gx-24-24"></div>
        </div>
      `, field);
      let input = field.create(field.value);
      el.children[1].appendChild(input);
    } else {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-24">{{title}}</label>
          <div class="gx-24-24 d-flex">
            <input type="text" name="{{name}}" class="gx-form-control" placeholder="请填写">
            {{#if unit}}
            <span class="ml-auto text-muted small mr-2 mt-2">{{unit}}</span>
            {{/if}}
          </div>
        </div>
      `, field);
      if (this.readonly === true) {
        dom.find('input', el).setAttribute('placeholder', '');
        dom.find('input', el).setAttribute('readonly', true);
      }
    }
    ret.appendChild(el);
  }
  return ret;
};

SingleColumnForm.prototype.buildDate = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex">
        <input type="text" class="gx-form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="gx-ml-auto gx-pos-relative gx-fs-18 fas fa-calendar" style="top: 5px; left: -2px;"></span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      confirm: date => {
        let row = dom.ancestor(ev.target, 'div', 'gx-24-24');
        if (!date || date == '') {
          dom.find('input[type=text]', row).value = '';
          dom.find('input[type=hidden]', row).value = '';
          return;
        }
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

SingleColumnForm.prototype.buildTime = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex">
        <input type="text" class="gx-form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="ml-auto material-icons font-16 position-relative" style="top: 5px; left: -2px;">schedule</span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      confirm: date => {
        let row = dom.ancestor(ev.target, 'div', 'gx-24-24');
        if (!date || date == '') {
          dom.find('input[type=text]', row).value = '';
          dom.find('input[type=hidden]', row).value = '';
          return;
        }
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

SingleColumnForm.prototype.buildSwitch = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex pr-3 pl-3">
        <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1" style="min-width: 48px;">
        <input class="c-switch-input" value="T" name="{{name}}" type="checkbox">
        <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
      </label>
      </div>
    </div>
  `, field);
  return ret;
};

SingleColumnForm.prototype.buildRadio = async function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 input-group pr-3 pl-3"></div>
    </div>
  `, field);

  if (this.readonly === true) {
    ret.children[1].innerText = field.text || '';
    return ret;
  }

  for (let row of field.options.values) {
    row.checked = row.checked || false;
    let el = dom.templatize(`
      <div class="form-check form-check-inline">
        <input name="{{name}}" value="{{value}}" {{#if checked}}checked{{/if}} type="radio" class="form-check-input radio color-primary is-outline">
        <label class="form-check-label" for="">{{text}}</label>
      </div>
    `, {...row, name: field.name});
    ret.children[1].appendChild(el);
  }
  return ret;
};

SingleColumnForm.prototype.buildCheck = async function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 input-group pr-3 pl-3"></div>
    </div>
  `, field);

  if (this.readonly === true) {
    ret.children[1].innerText = field.text || '';
    return ret;
  }

  for (let row of field.options.values) {
    row.checked = row.checked || false;
    let el = dom.templatize(`
      <div class="form-check form-check-inline">
        <input name="{{name}}" value="{{value}}" {{#if checked}}checked{{/if}} type="checkbox" class="form-check-input checkbox color-primary is-outline">
        <label class="form-check-label" for="">{{text}}</label>
      </div>
    `, {...row, name: field.name});
    ret.children[1].appendChild(el);
  }
  return ret;
};

SingleColumnForm.prototype.buildSelect = async function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex">
        <input type="text" class="gx-form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="gx-ml-auto gx-pos-relative gx-fs-16 fas fa-chevron-down" style="top: 8px; left: -2px;"></span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  let values = field.values;
  if (!values && field.url) {
    let data = [];
    data = await xhr.promise({
      url: field.url,
      params: {},
    });
    values = [];
    for (let i = 0; i < data.length; i++) {
      values.push({
        text: data[i][field.textField],
        value: data[i][field.valueField],
      });
    }
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      format: 'oo',
      values: values,
      confirm: data => {
        let row = dom.ancestor(ev.target, 'div', 'gx-24-24');
        if (!data || data == '') {
          dom.find('input[type=text]', row).value = '';
          dom.find('input[type=hidden]', row).value = '';
          return;
        }
        dom.find('input[type=text]', row).value = data.text;
        dom.find('input[type=hidden]', row).value = data.value;
      },
    });
    rd.show();
  });
  return ret;
};

SingleColumnForm.prototype.buildMobile = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex">
        <input type="text" name="{{name}}" class="gx-form-control" readonly placeholder="请输入...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new Numpad({
      type: 'mobile',
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

SingleColumnForm.prototype.buildId = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex">
        <input type="text" name="{{name}}" class="gx-form-control" readonly placeholder="请输入...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new Numpad({
      type: 'id',
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

SingleColumnForm.prototype.buildDistrict = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex">
        <input type="text" name="{{name}}" class="gx-form-control" readonly placeholder="请选择...">
        <span class="gx-ml-auto gx-pos-relative gx-fs-16 fas fa-chevron-down" style="top: 8px;left: -2px;"></span>
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new DistrictPicker({
      type: 'id',
      success: (val) => {
        let str = '';
        if (val.province) {
          str += val.province.chineseDistrictName;
        }
        if (val.city) {
          str += ' ' + val.city.chineseDistrictName;
        }
        if (val.county) {
          str += ' ' + val.county.chineseDistrictName;
        }
        if (val.town) {
          str += ' ' + val.town.chineseDistrictName;
        }
        input.value = str;
        input.setAttribute('data-value', JSON.stringify(val));
      }
    }).show(document.body);
  });
  return ret;
};

SingleColumnForm.prototype.buildRuler = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex">
        <input type="text" name="{{name}}" class="gx-form-control" readonly placeholder="请选择...">
        {{#if unit}}
        <span class="gx-ml-auto gx-pos-relative gx-mr-8" style="top:6px;">{{unit}}</span>
        {{/if}}
        <span class="gx-ml-auto gx-pos-relative gx-fs-16 fas fa-ruler-horizontal" style="top: 8px;left: -2px;"></span>
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  if (field.value) {
    input.value = field.value;
  }
  dom.bind(ret, 'click', ev => {
    new PopupRuler({
      range: field.range,
      height: 70,
      value: input.value,
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

SingleColumnForm.prototype.buildSegment = function (field) {
  let opt = field.options || {};
  let ret = dom.templatize(`
    <div class="gx-form-group row pb-2">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="segment-group gx-24-24">
        {{#values}}
        <div class="segment" data-model-value="{{value}}">{{text}}</div>
        {{/values}}
      </div>
    </div>  
  `, {
    ...field,
    ...opt,
  });
  let segments = ret.querySelectorAll('.segment');
  for (let seg of segments) {
    dom.bind(seg, 'click', ev => {
      let seg = dom.ancestor(ev.target, 'div', 'segment');

      for (let child of seg.parentElement.children) {
        child.classList.remove('active');
      }
      seg.classList.add('active');
    });
  }
  return ret;
};

SingleColumnForm.prototype.buildImages = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group row pb-2">
      <label class="gx-form-label gx-24-24">{{title}}</label>
      <div class="gx-24-24 d-flex">
        <div class="d-flex align-items-center justify-content-center" 
             style="height: 80px; width: 80px; border: 1px solid #eee;">
          <i class="gx-i gx-i-plus" style="color: #bbb;"></i>
        </div>
      </div>
    </div>
  `, field);
  return ret;
};

function Tabs(opts) {
  this.navigator = dom.find(opts.navigatorId);
  this.navigator.classList.add('gx-d-flex', 'gx-pos-relative', 'align-items-center');
  this.content = dom.find(opts.contentId);
  this.tabActiveClass = opts.tabActiveClass;
  this.tabs = opts.tabs;
  this.lazy = opts.lazy !== false;
  this.autoClear = opts.autoClear === true;
}

Tabs.prototype.loadPage = function(id, url, hidden, success) {
  let contentPage = dom.find(`div[data-tab-content-id="${id}"]`);
  if (contentPage == null) {
    contentPage = dom.templatize('<div data-tab-content-id="{{id}}"></div>', {id: id});
    this.content.appendChild(contentPage);
  } else {
    contentPage.innerHTML = '';
  }
  if (typeof url !== 'undefined' && url != 'undefined' && url != '') {
    ajax.view({
      url: url,
      containerId: contentPage,
      success: success || function () {

      }
    });
  } else {
    if (success) {
      success({
        id: contentPage.getAttribute('data-tab-content-id'),
      });
    }
  }
  if (hidden === true) {
    contentPage.style.display = 'none';
  }
};

Tabs.prototype.reload = function (params) {
  let index = 0;
  let nav = this.navigator.children[index];
  for (let i = 1; i < this.navigator.children.length; i++) {
    let child = this.navigator.children[i];
    if (child.classList.contains(this.tabActiveClass)) {
      index = i - 1;
      nav = child;
      break;
    }
  }
  this.loadPage(nav.getAttribute('data-tab-id'), nav.getAttribute('data-tab-url'),
    false, params => {
      this.tabs[index].success(params);
    });
};

Tabs.prototype.render = function() {
  let self = this;

  if (this.content) {
    this.content.innerHTML = '';
  }
  this.navigator.innerHTML = '';

  this.slider = dom.element('<div class="slider"></div>');
  this.navigator.appendChild(this.slider);

  this.tabs.forEach((tab, idx) => {
    tab.style = tab.style || 'padding: 0 16px;';
    if (tab.style) {
      tab.style = tab.style;
    } else {
      tab.style += 'min-width: ' + (tab.title.length * 16 + 32) + 'px;text-align: center;';
    }
    let nav = dom.templatize(`
      <div class="nav-item" style="{{style}}"
           data-tab-url="{{{url}}}"
           data-tab-id="{{{id}}}" >{{{title}}}</div>
    `, tab);
    self.navigator.appendChild(nav);

    // 绑定Tab点击事件
    dom.bind(nav, 'click', (ev) => {
      if (nav.classList.contains(self.tabActiveClass)) {
        return;
      }

      // 处理以前激活的页签及内容
      for (let i = 0; i < self.navigator.children.length; i++) {
        let _nav = self.navigator.children[i];
        _nav.classList.remove(self.tabActiveClass);
      }

      if (self.content) {
        for (let i = 0; i < self.content.children.length; i++) {
          self.content.children[i].style.display = 'none';
        }
      }

      // 激活现在点击的页签及内容
      self.activate(nav);

      if (this.autoClear === true) {
        // 只有在懒加载情况下，设置自动清除内容才有效
        this.content.innerHTML = '';
      }
      let contentPage = dom.find('div[data-tab-content-id="' + nav.getAttribute('data-tab-id') + '"]', self.content);
      if (contentPage != null) {
        contentPage.style.display = '';
      } else {
        if (tab.onClicked) {
          tab.onClicked(ev);
        } else {
          let id = nav.getAttribute('data-tab-id');
          let url = nav.getAttribute('data-tab-url');
          self.loadPage(id, url, false, tab.success);
        }
      }
    });

    // 激活默认页签及内容
    if (self.lazy === true) {
      if (idx == 0) {
        self.activate(nav);
        if (tab.onClicked) {
          tab.onClicked();
        } else {
          self.loadPage(tab.id, tab.url, false, tab.success);
        }
      }
    } else {
      if (idx == 0) {
        self.activate(nav);
        if (tab.onClicked) {
          tab.onClicked();
        } else {
          self.loadPage(tab.id, tab.url, false, tab.success);
        }
      } else {
        if (tab.onClicked) {
          tab.onClicked();
        } else {
          self.loadPage(tab.id, tab.url, true, tab.success);
        }
      }
    }
  });
};

Tabs.prototype.activate = function (nav) {
  nav.classList.add(this.tabActiveClass);
  this.slider.style.width = nav.clientWidth + 'px';
  this.slider.style.left = nav.offsetLeft + 'px';
};

function TwoColumnForm(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
}

TwoColumnForm.prototype.render = async function (container) {
  container.innerHTML = '';
  let root = await this.root();
  container.appendChild(root);
};

TwoColumnForm.prototype.root = async function() {
  let ret = dom.element(`
    <div class="gx-form"></div>
  `);
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let el = null;
    if (field.input === 'date') {
      el = this.buildDate(field);
    } else if (field.input === 'time') {
      el = this.buildTime(field);
    } else if (field.input === 'bool') {
      el = this.buildSwitch(field);
    } else if (field.input === 'radio') {
      el = await this.buildRadio(field);
    } else if (field.input === 'check') {
      el = await this.buildCheck(field);
    } else if (field.input === 'select') {
      el = await this.buildSelect(field);
    } else if (field.input === 'hidden') {
      el = dom.templatize(`
        <input type="hidden" name="{{name}}">
      `, field);
    } else if (field.input === 'mobile') {
      el = this.buildMobile(field);
    } else if (field.input === 'id') {
      el = this.buildId(field);
    } else if (field.input === 'district') {
      el = this.buildDistrict(field);
    } else if (field.input === 'ruler') {
      el = this.buildRuler(field);
    } else if (field.input === 'segment') {
      el = this.buildSegment(field);
    } else if (field.input === 'images') {
      el = this.buildImages(field);
    } else if (field.input === 'longtext') {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-06">{{title}}</label>
          <div class="gx-24-18">
            <textarea type="text" name="{{name}}" class="gx-form-control" placeholder="请填写"></textarea>
          </div>
        </div>
      `, field);
      if (this.readonly === true) {
        dom.find('textarea', el).setAttribute('placeholder', '');
        dom.find('textarea', el).setAttribute('readonly', true);
      }
    } else if (field.input === 'icon') {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-06">{{title}}</label>
          <div class="gx-24-18"></div>
        </div>
      `, field);
      let input = field.create(field.value);
      el.children[1].appendChild(input);
    } else if (field.input === 'icons') {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-06">{{title}}</label>
          <div class="gx-24-18"></div>
        </div>
      `, field);
      let input = field.create(field.value);
      el.children[1].appendChild(input);
    } else if (field.input === 'rating') {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-06">{{title}}</label>
          <div class="gx-24-18"></div>
        </div>
      `, field);
      let input = field.create(field.value);
      el.children[1].appendChild(input);
    } else {
      el = dom.templatize(`
        <div class="gx-form-group gx-row">
          <label class="gx-form-label gx-24-06">{{title}}</label>
          <div class="gx-24-18 d-flex">
            <input type="text" name="{{name}}" class="gx-form-control" placeholder="请填写">
            {{#if unit}}
            <span class="ml-auto text-muted small mr-2 mt-2">{{unit}}</span>
            {{/if}}
          </div>
        </div>
      `, field);
      if (this.readonly === true) {
        dom.find('input', el).setAttribute('placeholder', '');
        dom.find('input', el).setAttribute('readonly', true);
      }
    }
    ret.appendChild(el);
  }
  return ret;
};

TwoColumnForm.prototype.buildDate = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <input type="text" class="gx-form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="gx-ml-auto gx-pos-relative gx-fs-18 fas fa-calendar" style="top: 5px; left: -2px;"></span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      confirm: date => {
        let row = dom.ancestor(ev.target, 'div', 'gx-24-18');
        if (!date || date == '') {
          dom.find('input[type=text]', row).value = '';
          dom.find('input[type=hidden]', row).value = '';
          return;
        }
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

TwoColumnForm.prototype.buildTime = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <input type="text" class="gx-form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="ml-auto material-icons font-16 position-relative" style="top: 5px; left: -2px;">schedule</span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      confirm: date => {
        let row = dom.ancestor(ev.target, 'div', 'gx-24-18');
        if (!date || date == '') {
          dom.find('input[type=text]', row).value = '';
          dom.find('input[type=hidden]', row).value = '';
          return;
        }
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

TwoColumnForm.prototype.buildSwitch = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex pr-3 pl-3">
        <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1" style="min-width: 48px;">
        <input class="c-switch-input" value="T" name="{{name}}" type="checkbox">
        <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
      </label>
      </div>
    </div>
  `, field);
  return ret;
};

TwoColumnForm.prototype.buildRadio = async function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 input-group pr-3 pl-3"></div>
    </div>
  `, field);

  if (this.readonly === true) {
    ret.children[1].innerText = field.text || '';
    return ret;
  }

  for (let row of field.options.values) {
    row.checked = row.checked || false;
    let el = dom.templatize(`
      <div class="form-check form-check-inline">
        <input name="{{name}}" value="{{value}}" {{#if checked}}checked{{/if}} type="radio" class="form-check-input radio color-primary is-outline">
        <label class="form-check-label" for="">{{text}}</label>
      </div>
    `, {...row, name: field.name});
    ret.children[1].appendChild(el);
  }
  return ret;
};

TwoColumnForm.prototype.buildCheck = async function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 input-group pr-3 pl-3"></div>
    </div>
  `, field);

  if (this.readonly === true) {
    ret.children[1].innerText = field.text || '';
    return ret;
  }

  for (let row of field.options.values) {
    row.checked = row.checked || false;
    let el = dom.templatize(`
      <div class="form-check form-check-inline">
        <input name="{{name}}" value="{{value}}" {{#if checked}}checked{{/if}} type="checkbox" class="form-check-input checkbox color-primary is-outline">
        <label class="form-check-label" for="">{{text}}</label>
      </div>
    `, {...row, name: field.name});
    ret.children[1].appendChild(el);
  }
  return ret;
};

TwoColumnForm.prototype.buildSelect = async function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <input type="text" class="gx-form-control" readonly placeholder="请选择...">
        <input type="hidden" name="{{name}}">
        <span class="gx-ml-auto gx-pos-relative gx-fs-16 fas fa-chevron-down" style="top: 8px; left: -2px;"></span>
      </div>
    </div>
  `, field);
  if (this.readonly === true) {
    ret.querySelectorAll('input')[0].setAttribute('placeholder', '');
    return ret;
  }
  let values = field.values;
  if (!values && field.url) {
    let data = [];
    data = await xhr.promise({
      url: field.url,
      params: {},
    });
    values = [];
    for (let i = 0; i < data.length; i++) {
      values.push({
        text: data[i][field.textField],
        value: data[i][field.valueField],
      });
    }
  }
  dom.bind(ret, 'click', ev => {
    let rd = new Rolldate({
      title: field.title,
      format: 'oo',
      values: values,
      confirm: data => {
        let row = dom.ancestor(ev.target, 'div', 'gx-24-18');
        if (!data || data == '') {
          dom.find('input[type=text]', row).value = '';
          dom.find('input[type=hidden]', row).value = '';
          return;
        }
        dom.find('input[type=text]', row).value = data.text;
        dom.find('input[type=hidden]', row).value = data.value;
      },
    });
    rd.show();
  });
  return ret;
};

TwoColumnForm.prototype.buildMobile = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <input type="text" name="{{name}}" class="gx-form-control" readonly placeholder="请输入...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new Numpad({
      type: 'mobile',
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

TwoColumnForm.prototype.buildId = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <input type="text" name="{{name}}" class="gx-form-control" readonly placeholder="请输入...">
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new Numpad({
      type: 'id',
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

TwoColumnForm.prototype.buildDistrict = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <input type="text" name="{{name}}" class="gx-form-control" readonly placeholder="请选择...">
        <span class="gx-ml-auto gx-pos-relative gx-fs-16 fas fa-chevron-down" style="top: 8px;left: -2px;"></span>
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  dom.bind(ret, 'click', ev => {
    new DistrictPicker({
      type: 'id',
      success: (val) => {
        let str = '';
        if (val.province) {
          str += val.province.chineseDistrictName;
        }
        if (val.city) {
          str += ' ' + val.city.chineseDistrictName;
        }
        if (val.county) {
          str += ' ' + val.county.chineseDistrictName;
        }
        if (val.town) {
          str += ' ' + val.town.chineseDistrictName;
        }
        input.value = str;
        input.setAttribute('data-value', JSON.stringify(val));
      }
    }).show(document.body);
  });
  return ret;
};

TwoColumnForm.prototype.buildRuler = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group gx-row">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <input type="text" name="{{name}}" class="gx-form-control" readonly placeholder="请选择...">
        {{#if unit}}
        <span class="gx-ml-auto gx-pos-relative gx-mr-8" style="top:6px;">{{unit}}</span>
        {{/if}}
        <span class="gx-ml-auto gx-pos-relative gx-fs-16 fas fa-ruler-horizontal" style="top: 8px;left: -2px;"></span>
      </div>
    </div>
  `, field);
  let input = dom.find('input', ret);
  if (this.readonly === true) {
    input.setAttribute('placeholder', '');
    return ret;
  }
  if (field.value) {
    input.value = field.value;
  }
  dom.bind(ret, 'click', ev => {
    new PopupRuler({
      range: field.range,
      height: 70,
      value: input.value,
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

TwoColumnForm.prototype.buildSegment = function (field) {
  let opt = field.options || {};
  let ret = dom.templatize(`
    <div class="gx-form-group row pb-2">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="segment-group gx-24-18">
        {{#values}}
        <div class="segment" data-model-value="{{value}}">{{text}}</div>
        {{/values}}
      </div>
    </div>  
  `, {
    ...field,
    ...opt,
  });
  let segments = ret.querySelectorAll('.segment');
  for (let seg of segments) {
    dom.bind(seg, 'click', ev => {
      let seg = dom.ancestor(ev.target, 'div', 'segment');
      for (let child of seg.parentElement.children) {
        child.classList.remove('active');
      }
      seg.classList.add('active');
    });
  }
  return ret;
};

TwoColumnForm.prototype.buildImages = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group row pb-2">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <div class="d-flex align-items-center justify-content-center" 
             style="height: 80px; width: 80px; border: 1px solid #eee;">
          <i class="gx-i gx-i-plus" style="color: #bbb;"></i>
        </div>
      </div>
    </div>
  `, field);
  return ret;
};