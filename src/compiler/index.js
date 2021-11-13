import { parserHTML } from './parser';
import { generate } from './generate';

export function compileToFunction(template) {
  let root = parserHTML(template);

  // 生成代码
  let code = generate(root);

  let render = new Function(`with(this){return ${code}}`);  //code 中会用到数据 数据在vm上

  return render;

  // render(){
  //   return _c('div', { id: 'app', a: 1 }, 'hello')
  // }

  // {tag: div, data: {id: 'app', a: 1,...}, children: [{text: 'hello'}]}

  // html => ast（只能描述语法 语法不存在的属性无法描述） => render函数 + (with + new Function) => 虚拟dom（增加额外的属性） => 生成真实dom
}

