export function isFunction(val) {
  return typeof val === 'function';
}

export function isObject(val) {
  return typeof val === 'object' && val !== null;
}

const callbacks = [];
function flushCallbacks() {
  callbacks.forEach(cb => cb());
  waiting = false;
}

let waiting = false;
function timer(flushCallbacks) {
  let timerFn = () => { };

  if (Promise) {
    timerFn = () => {
      Promise.resolve().then(flushCallbacks);
    }
  } else if (MutationObserver) {
    let textNode = document.createTextNode(1);
    let observe = new MutationObserver(flushCallbacks);
    observe.observe(textNode, {
      characterData: true
    })

    timerFn = () => {
      textNode.textContent = 3;
    }
  } else if (setImmediate) {
    timerFn = () => {
      setImmediate(flushCallbacks);
    }
  } else {
    timerFn = () => {
      setTimeout(flushCallbacks);
    }
  }
  timerFn();
  waiting = false;
}


// 微任务是在页面渲染钱执行 我取得的是内存中的dom，不关心你渲染完毕没有

export function nextTick(cb) {
  callbacks.push(cb);

  if (!waiting) {
    timer(flushCallbacks);  //vue2中考虑了兼容性问题 vue3里面不再考虑兼容性问题
    waiting = true;
  }
}

let lifecycleHooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed'
]

let strats = {};  //存放各种策略
// {}  {beforeCreate:fn} => {beforeCreate:[fn]}
// {beforeCreate:[fn]}  {beforeCreate:[fn]} => {beforeCreate:[fn,fn]}
function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal);  //后续
    } else {
      return [childVal];  //第一次
    }
  } else {
    return parentVal;
  }
}
lifecycleHooks.forEach(hook => {
  strats[hook] = mergeHook
})

strats.components = function (parentVal, childVal) {
  let options = Object.create(parentVal); //根据福对象构造一个新对象 options.__proto__
  if (childVal) {
    for (let key in childVal) {
      options[key] = childVal[key];
    }
  }
  return options;
}

// { a: 1, data: {} } { data: {} }
export function mergeOptions(parent, child) {
  const options = {};  //合并后的结果
  for (let key in parent) {
    mergeField(key);
  }

  for (let key in child) {
    if (parent.hasOwnProperty(key)) {
      continue;
    }
    mergeField(key);
  }

  function mergeField(key) {
    let parentVal = parent[key];
    let childVal = child[key];
    // 策略模式
    if (strats[key]) {  //如果有对应的策略，就调用对应的策略即可
      options[key] = strats[key](parentVal, childVal);
    } else {
      if (isObject(parentVal) && isObject(childVal)) {
        options[key] = { ...parentVal, ...childVal };
      } else {
        options[key] = child[key];
      }
    }
  }

  return options;
}

// console.log(mergeOptions({ beforeCreate: [() => { }] }, { beforeCreate() { } }));