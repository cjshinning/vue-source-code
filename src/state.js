import { isFunction } from './utils';
import { observe } from './observer/index';

export function initState(vm) { //状态初始化
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}

function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    }
  })
}

function initData(vm) {
  let data = vm.$options.data;  //vm.$el vue内部会对属性检测，如果以$开头，不会进行代码
  // vue2中会将data中的所有数据 进行数据劫持 Object.defineProperty
  // 这时vm和data没有任何关系，通过_data进行关联
  data = vm._data = isFunction(data) ? data.call(vm) : data;

  // 用户去vm.xxx => vm._data.xxx
  for (let key in data) {
    proxy(vm, '_data', key);
  }

  observe(data);
}