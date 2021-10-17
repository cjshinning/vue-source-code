import { isFunction } from './utils';
import { observe } from './oberver/index';

export function initState(vm) { //状态初始化
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}

function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = isFunction(data) ? data.call(vm) : data;

  // 这时vm和data没有任何关系，通过_data进行关联
  observe(data);
}