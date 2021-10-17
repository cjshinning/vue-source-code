import { isObject } from '../utils';

// 检测数据变类 类有类型，对象无类型
class Observer {
  constructor(data) { //对对象中的所有熟悉进行劫持
    this.walk(data);
  }
  walk(data) { //对象
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key]);
    })
  }
}

// vue2 会对对象进行遍历 将每个熟悉 用的defineProperty重新定义，性能查
function defineReactive(data, key, value) {
  observe(value); //本身用户默认值是对象套对象，需要地柜处理（性能差）
  Object.defineProperty(data, key, {
    get() {
      return value;
    },
    set(newV) {
      observe(newV);  //如果用户赋值一个新对象，需要将这个对象进行劫持
      value = newV;
    }
  })
}

export function observe(data) {
  // 如果是对象才观测
  if (!isObject(data)) {
    return;
  }

  // 默认最外层的data必须一个对象
  return new Observer(data);
}