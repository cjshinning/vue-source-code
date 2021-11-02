const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  //标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;  //用来获取的标签名的match的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签的
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  //匹配属性
// 匹配标签结束的 >
const startTagClose = /^\s*(\/?)>/;
// 匹配 {{ }} 表达式
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

// let r = '<xxx>'.match(new RegExp(qnameCapture));
// console.log(r);

// html字符串解析成dom树 <div id="app">{{name}}</div>

function start(tagName, attributes) {
  console.log('start', tagName, attributes);
}

function end(tagName) {
  console.log('end', tagName);
}

function chars(text) {
  console.log('chars', text);
}

function parserHTML(html) { // id="app">123123</div>
  function advance(len) {
    html = html.substring(len);
  }

  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length);
      let end;
      // 如果没有遇到标签结尾就不停的解析
      let attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
        advance(attr[0].length);
      }
      if (end) {
        advance(end.length);
      }
      return match;
    }
    return false;
  }

  while (html) {  //看解析的内容是否存在，如果存在就不停的解析
    let textEnd = html.indexOf('<');  //当前解析的开发
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(html);
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    }
    let text; //123123</div>
    if (textEnd > 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      chars(text);
      advance(text.length);
    }

  }
}

export function compileToFunction(template) {
  // console.log(template);
  parserHTML(template);

}