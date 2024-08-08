
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

TwoColumnForm.prototype.buildImages = function (field) {
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