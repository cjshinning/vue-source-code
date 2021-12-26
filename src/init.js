import { initState } from './state';
import { compileToFunction } from './compiler/index';
import { mountComponent, callHook } from './lifecycle';
import { mergeOptions } from './utils';

export function initMixin(Vue) { //表示在vue的基础上做一次混合操作
  Vue.prototype._init = function (options) {
    const vm = this;  //var that = this;
    vm.$options = mergeOptions(vm.constructor.options, options);  //后面会对options进行扩展操作

    console.log(vm.$options);
    callHook(vm, 'beforeCreate');
    // 对数据进行初始化 watch computed props data ...
    initState(vm);  //vm.$options.data 数据劫持
    callHook(vm, 'created');

    if (vm.$options.el) {
      // 将数据挂载到这个模板上
      vm.$mount(vm.$options.el);
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);
    vm.$el = el;
    // 把模板转换成对应的渲染函数 => 虚拟dom概念 vnode => diff算法 更新虚拟 => 产生真是节点、更新
    if (!options.render) {  // 没有render用template，目前没有render
      let template = options.template;
      if (!template && el) {  // 用户也没有传递template 就去el的内容做模板
        template = el.outerHTML;
        let render = compileToFunction(template);
        options.render = render;
      }
    }
    // options.render 就是渲染函数
    // console.log(options.render);  //调用render方法 渲染成真实dom 替换掉页面的内容

    mountComponent(vm, el); //组件的挂载流程
  }
}