import { isFunction } from './utils';
import { observe } from './observer/index';
import Watcher from './observer/watcher';
import Dep from './observer/dep';

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    options.user = true;  //是一个用户自己写的watcher
    // vm,name,用户回调cb,options.user
    new Watcher(this, key, handler, options);
  }
}

export function initState(vm) { //状态初始化
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm, opts.computed);
  }
  if (opts.watch) { //初始化watch
    initWatch(vm, opts.watch);
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

function initWatch(vm, watch) {
  for (let key in watch) {
    let handler = watch[key];

    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, key, handler) {
  return vm.$watch(key, handler);
}

function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = {};
  for (let key in computed) {
    const userDef = computed[key];

    // 依赖的属性一变就重新取值 get
    let getter = typeof userDef == 'function' ? userDef : userDef.get;

    // 每个计算属性本质就是watcher 目前还没用
    // 将watcher和属性做一个映射
    watchers[key] = new Watcher(vm, getter, () => { }, { lazy: true });  //默认不执行

    // 将key定义在vm上
    defineComputed(vm, key, userDef);
  }
}

function createComputedGetter(key) {
  return function computedGetter() { //取计算属性的值 走的这个函数
    // this._computedWatchers包含着所有的计算属性
    // 通过key可以拿到对应的watcher，这个watcher中包含了getter
    let watcher = this._computedWatchers[key];
    // 通过key可以拿到对应的watcher，这个watcher中包含了getter
    // 脏就是要调用用户的getter 不脏就是不要调用getter
    if (watcher.dirty) {  //根据dirty属性来判断是否要重新求值
      watcher.evaluate();
    }
    // 如果当前取完值后 Dep.target还有值，需要继续向上收集
    if (Dep.target) {
      // 计算属性watcher内部有两个dep firstName,lastName
      watcher.depend(); //watcher里对应了多个dep
    }
    return watcher.value;
  }
}

function defineComputed(vm, key, userDef) {
  let sharePropety = {};
  if (typeof userDef === 'function') {
    sharePropety.get = userDef;
  } else {
    sharePropety.get = createComputedGetter(key);
    sharePropety.set = userDef.set;
  }
  Object.defineProperty(vm, key, sharePropety); //computed就是Object.defineProperty
}