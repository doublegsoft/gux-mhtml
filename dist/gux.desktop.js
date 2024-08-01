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
          elm.setAttribute(utils.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(utils.nameAttr(key), data[key]);
        }
      }
    } else {
      for (let i = 0; i < attrs.length; i++) {
        let key = attrs[i];
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(utils.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(utils.nameAttr(key), data[key]);
        }
      }
    }
  } else {
    let ret = {};
    Array.prototype.slice.call(elm.attributes).forEach(function(attr) {
      if (attr.name.indexOf('data-model-') == 0) {
        if (attr.value.indexOf('{') == 0) {
          try {
            ret[utils.nameVar(attr.name.slice('data-model-'.length))] = JSON.parse(attr.value);
          } catch (err) {
            ret[utils.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
          }
        } else {
          ret[utils.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
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
        item[name[j]] = elements[i].getAttribute(utils.nameAttr(name[j]));
      }
    } else {
      item[name] = elements.getAttribute(utils.nameAttr(name[j]));
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
      element.setAttribute(utils.nameAttr(name[i]), data[name[i]]);
    }
  } else {
    element.setAttribute(utils.nameAttr(name), data[name]);
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
};

gux.navigateTo = async function (url, opt, clear) {
  clearTimeout(gux.delayToLoad);
  if (typeof clear === "undefined") clear = false;
  let main = document.querySelector('main');

  if (gux.presentPageObj) {
    gux.presentPageObj.page.classList.remove('in');
    gux.presentPageObj.page.classList.add('out');
  }
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
    let html = await xhr.asyncGet({
      url: url + (url.indexOf('?') == -1 ? '?' : '&') + new Date().getTime(),
    }, 'GET');
    gux.reload(main, url, html, opt);
  }, 400);
};

gux.switchTab = function(url, opt) {
  xhr.get({
    url: url,
  }).then(resp => {
    if (opt.title) {
      pageIndex.setTitle(opt.title);
    }
    if (opt.noNavigationBar === true) {
      pageIndex.hideNavigationBar();
    } else {
      pageIndex.showNavigationBar();
    }

    let page = dom.append(pageIndex.container, resp, true);
    if (page && page.id) {
      window[page.id].show(opt.params || {});
      gux.presentPageObj = window[page.id];
    }

    if (opt.noPull2Refresh === true) {
      pageIndex.uninstallPull2Refresh();
    } else {
      pageIndex.installPull2Refresh();
    }
  });
};

gux.navigateWidget = function (url, container, opt) {
  clearTimeout(gux.delayToLoad);
  gux.delayToLoad = setTimeout(() => {
    if (container.children[0]) {
      container.children[0].classList.remove('in');
      container.children[0].classList.add('out');
    }
    setTimeout(async () => {
      container.innerHTML = '';
      let html = await xhr.asyncGet({
        url: url,
      }, 'GET');
      gux.replace(container, url, html, opt);
    }, 400);
  }, 200);
};

gux.navigateBack = function (opt) {
  clearTimeout(gux.delayToLoad);
  gux.delayToLoad = setTimeout(() => {
    let main = document.querySelector('main');
    let latest = main.children[main.children.length - 2];

    gux.presentPageObj.page.classList.remove('in');
    gux.presentPageObj.page.classList.add('out');

    setTimeout(() => {
      gux.presentPageObj.page.parentElement.remove();
      if (gux.presentPageObj.destroy) {
        gux.presentPageObj.destroy();
      }
      delete gux.presentPageObj;

      latest.style.display = '';
      gux.presentPageObj = window[latest.getAttribute('gux-page-id')];
      gux.presentPageObj.page.classList.remove('out');
      gux.presentPageObj.page.classList.add('in');

      gux.setTitleAndIcon(latest.getAttribute('gux-page-title'),
        latest.getAttribute('gux-page-icon'));
    }, 400 /*同CSS中的动画效果配置时间一致*/);
  }, 200);
};

gux.reload = function (main, url, html, opt) {
  opt = opt || {};
  let fragmentContainer = dom.element(`<div style="height: 100%; width: 100%;"></div>`);
  let range = document.createRange();
  let fragment = range.createContextualFragment(html);
  fragmentContainer.appendChild(fragment);
  let page = dom.find('[id^=page]', fragmentContainer);
  let pageId = page.getAttribute('id');

  main.appendChild(fragmentContainer);

  fragmentContainer.setAttribute('gux-page-id', pageId);
  fragmentContainer.setAttribute('gux-page-url', url);

  if (opt.title) {
    fragmentContainer.setAttribute('gux-page-title', opt.title);
    fragmentContainer.setAttribute('gux-page-icon', opt.icon || '');
  }

  gux.presentPageObj = window[pageId];
  gux.presentPageObj.page.classList.add('in');

  let params = utils.getParameters(url);
  gux.presentPageObj.show(params);

  gux.setTitleAndIcon(opt.title, opt.icon);
  if (opt.success) {
    opt.success();
  }
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

  let params = utils.getParameters(url);
  window[pageId].show(params);

  // pass options to page object
  for (let key in opt) {
    window[pageId][key] = opt[key];
  }

  if (opt.success) {
    opt.success();
  }
};

gux.setTitleAndIcon = function(title, icon) {
  let bottomDiv = dom.find('.bottom-navigator');
  let titleDiv = dom.find('header h1.title');
  titleDiv.innerText = title;
  let iconDiv = dom.find('header div.left');
  if (icon) {
    iconDiv.innerHTML = icon;
    if (bottomDiv != null)
      bottomDiv.style.display = '';
    iconDiv.onclick = (ev) => {}
  } else {
    iconDiv.innerHTML = '<i class="fas fa-arrow-left button icon"></i>';
    if (bottomDiv != null)
      bottomDiv.style.display = 'none';
    iconDiv.onclick = (ev) => {
      gux.navigateBack()
    }
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
  this.today = moment(new Date());
  this.currentMonth = moment(this.today).startOf('month');
  this.currentIndex = 1;
}

Calendar.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="calendar">
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
      date.innerHTML = day;
    }
    let dateVal = month.format('YYYY-MM-') + (day < 10 ? ('0' + day) : day);
    if (dateVal == this.today.format('YYYY-MM-DD')) {
      date.classList.add('today');
    }
    date.setAttribute('data-calendar-date', dateVal);
    row.appendChild(date);
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
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom district-picker">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
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
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom district-picker">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
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
  let value = dom.find('.value', ret);

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
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

function EditableForm(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
}

EditableForm.prototype.render = async function (container) {
  container.innerHTML = '';
  let root = await this.root();
  container.appendChild(root);
};

EditableForm.prototype.root = async function() {
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

EditableForm.prototype.buildDate = function (field) {
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
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

EditableForm.prototype.buildTime = function (field) {
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
        dom.find('input[type=text]', row).value = moment(date).format('YYYY年MM月DD日');
        dom.find('input[type=hidden]', row).value = moment(date).format('YYYY-MM-DD HH:mm:ss');
      },
    });
    rd.show();
  });
  return ret;
};

EditableForm.prototype.buildSwitch = function (field) {
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

EditableForm.prototype.buildRadio = async function (field) {
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

EditableForm.prototype.buildCheck = async function (field) {
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

EditableForm.prototype.buildSelect = async function (field) {
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
        dom.find('input[type=text]', row).value = data.text;
        dom.find('input[type=hidden]', row).value = data.value;
      },
    });
    rd.show();
  });
  return ret;
};

EditableForm.prototype.buildMobile = function (field) {
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

EditableForm.prototype.buildId = function (field) {
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

EditableForm.prototype.buildDistrict = function (field) {
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

EditableForm.prototype.buildRuler = function (field) {
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
  dom.bind(ret, 'click', ev => {
    new PopupRuler({
      range: field.range || [30, 150],
      height: 70,
      success: (val) => {
        input.value = val;
      }
    }).show(document.body);
  });
  return ret;
};

EditableForm.prototype.buildImages = function (field) {
  let ret = dom.templatize(`
    <div class="gx-form-group row pb-2">
      <label class="gx-form-label gx-24-06">{{title}}</label>
      <div class="gx-24-18 d-flex">
        <div class="d-flex align-items-center justify-content-center" 
             style="height: 80px; width: 80px; border: 1px solid #eee;">
          <i class="fas fa-plus" style="color: #bbb;"></i>
        </div>
      </div>
    </div>
  `, field);
  return ret;
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
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom numpad in">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div class="gx-d-flex gx-w-full" style="flex-wrap: wrap!important;">
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
  this.value = opt.value;
  this.range = opt.range;
}

PopupRuler.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom in">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
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
  let value = dom.find('.value', ret);

  dom.bind(mask, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
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
  value.innerText = this.value;
  ruler.initPlugin({
    el: content, //容器id
    startValue: this.value,
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