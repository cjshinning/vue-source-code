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

export default Vue;