import { isObject } from '../utils';
import { arrayMethods } from './array';
import Dep from './dep';

// 1. 如果数据是对象，会将对象不停的递归 进行劫持
// 2. 如果是数组，会劫持数组的方法，并对数组中不是基本数据类型的进行检测

// 检测数据变类 类有类型，对象无类型

// 如果给对象新增一个属性，不会触发视图更新 $set （给对象本身也增加一个dep，dep中存watcher，如果增加一个属性后，我就手动的触发watcher更新）
class Observer {
  constructor(data) { //对对象中的所有属性进行劫持

    this.dep = new Dep(); //数据可能是数组或者对象

    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false
    })
    // data.__ob__ = this; //所有被劫持过的属性都有__ob__
    if (Array.isArray(data)) {
      // 数组劫持的逻辑
      // 对数组原来的方法进行改写，切片编程， 高阶函数
      data.__proto__ = arrayMethods;
      // 如果数组中的数据是对象，需要监控对象的变化
      this.observeArray(data);
    } else {
      this.walk(data);  //对象劫持的逻辑
    }
  }
  observeArray(data) {  //对数组中的数组和数组中的对象再次劫持 递归了
    // 如果数组里放的是对象类型，也做了观测，JSON.stringify()也做了收集依赖了
    data.forEach(item => observe(item));
  }
  walk(data) { //对象
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key]);
    })
  }
}

function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i]; //current是数组里面的数组
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

// vue2 会对对象进行遍历 将每个熟悉 用的defineProperty重新定义，性能查
function defineReactive(data, key, value) {
  let childOb = observe(value); //本身用户默认值是对象套对象，需要地柜处理（性能差）
  let dep = new Dep();  //每个熟悉都有一个dep属性

  // console.log(childOb); //获取到数组对应的ob

  Object.defineProperty(data, key, {
    get() {
      // 取值时我希望将watcher和dep对应起来
      if (Dep.target) { //此值是在模板中取值的
        dep.depend(); //让dep记住watcher
        if (childOb) {  //可能是数组，可能是对象，对象也要收集依赖，后续写$set方法事更新触发他自己的更新操作
          childOb.dep.depend(); //就是让数组和对象也记住watcher
          if (Array.isArray(value)) { //取外层数组要将数组里面的进行收集
            dependArray(value);
          }
        }
      }
      // console.log(key, dep);
      return value;
    },
    set(newV) {
      // todo... 更新操作...
      if (newV !== value) {
        observe(newV);  //如果用户赋值一个新对象，需要将这个对象进行劫持
        value = newV;
        dep.notify(); //告诉当前的属性存放的watcher执行
      }
    }
  })
}

export function observe(data) {
  // 如果是对象才观测
  if (!isObject(data)) {
    return;
  }
  if (data.__ob__) {
    return data.__ob__;
  }

  // 默认最外层的data必须一个对象
  return new Observer(data);
}