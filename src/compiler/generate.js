// html字符串 => 字符串 _c('div', { id: 'app', a: 1 }, 'hello')

function genProps(attrs) {  //[{name: 'xxx', value: 'xxx'}]
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') {  //color:red;background:blue
      let styleObj = {};
      attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
        styleObj[arguments[1]] = arguments[2];
      })
      attr.value = styleObj;
    }

    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }

  // { a: 1, b: 2 }
  return `{${str.slice(0, -1)}}`
}

function gen(el) {
  if (el.type == 1) {
    return generate(el);
  } else {
    let text = el.text;
    console.log(el);
    return `_v('${text}')`;
  }
}

function genChildren(el) {
  let children = el.children;
  if (children) {
    return children.map(c => gen(c)).join(',');
  }
  return false;
}

export function generate(el) {
  // console.log('-----------', el); //_c('div', { id: 'app', a: 1 }, _c('span), {}, 'world _v())

  // 遍历树， 将树拼接成字符串
  let children = genChildren(el);
  let code = `_c('${el.tag}',${
    el.attrs.length ? genProps(el.attrs) : 'undefined'
    },${
    children ? `,${children}` : ''
    })`

  return code;
}
