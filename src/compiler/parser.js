const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  //标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;  //用来获取的标签名的match的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签的
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  //匹配属性
// 匹配标签结束的 >
const startTagClose = /^\s*(\/?)>/;
// 匹配 {{ }} 表达式
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;


export function parserHTML(html) { // id="app">123123</div>

  // html字符串解析成dom树 <div id="app">{{name}}</div>
  // 将解析后的结果 组装成一个树结构 栈
  // ast(语法层面的描述 js css html) vdom（dom节点）

  function createAstElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1,
      children: [],
      parent: null,
      attrs
    }
  }

  let root = null;
  let stack = [];

  function start(tagName, attributes) {
    // console.log('start', tagName, attributes);
    let parent = stack[stack.length - 1];
    let element = createAstElement(tagName, attributes);
    if (!root) {
      root = element;
    }
    if (parent) {
      element.parent = parent; //当访问栈中时  记录父亲是谁
      parent.children.push(element);
    }
    stack.push(element);
  }

  function end(tagName) {
    // console.log('end', tagName);
    let last = stack.pop();
    // console.log(last);
    if (last.tag !== tagName) {
      throw new Error('标签有误');
    }
  }

  function chars(text) {
    // console.log('chars', text);
    text = text.replace(/\s/g, "");
    let parent = stack[stack.length - 1];
    if (text) {
      parent.children.push({
        type: 3,
        text
      })
    }
  }

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
        advance(end[0].length);
      }
      return match;
    }
    return false;
  }

  while (html) {  //看解析的内容是否存在，如果存在就不停的解析
    // console.log(html);
    // debugger;
    let textEnd = html.indexOf('<');  //当前解析的开头
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

  return root;
}

// 看一下用户是否传入了，没传可能可能是template，template如果也没有传递
// 将我们的html => 词法解析 （开始标签，结束标签，属性，文本）
// => ast语法树 用来描述html语法的 stack=[]

// codegen <div>hello</div> => _c('div', {}, 'hello') => 让字符串执行
// 字符串如何转成代码 eval 耗性能 会有作用域问题
// 模板引擎 new Function + width 来实现