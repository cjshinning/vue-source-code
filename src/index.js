import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './render';
import { stateMixin } from './state';
import { initGlobalApi } from './global-api/index.js';

function Vue(options) {
  // options为用户传入的选项
  this._init(options);  //初始化操作，组件
}

initMixin(Vue);
renderMixin(Vue); //_render
lifecycleMixin(Vue);  //_update
stateMixin(Vue);

// 在类上扩展 Vue.mixin()
initGlobalApi(Vue);

import { compileToFunction } from './compiler/index.js';
import { createElm, patch } from './vdom/patch.js';
// diff 核心
let oldTemplate = `<div>
  <li key="A">A</li>
  <li key="B">B</li>
  <li key="C">C</li>
  <li key="D">D</li>
</div>`;
let vm1 = new Vue({ data: { message: 'hello world' } })
const render1 = compileToFunction(oldTemplate);
const oldVnode = render1.call(vm1);
document.body.appendChild(createElm(oldVnode));


// v-if v-else
let newTemplate = `<div>
  <li key="D">D</li>
  <li key="A">A</li>
  <li key="B">B</li>
  <li key="C">C</li>
</div>`;
let vm2 = new Vue({ data: { message: 'jenny' } })
const render2 = compileToFunction(newTemplate);
const newVnode = render2.call(vm2);

// 根据新的虚拟节点更新老的节点，老的能服用尽量复用

setTimeout(() => {
  patch(oldVnode, newVnode)
}, 2000)




export default Vue;