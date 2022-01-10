export function patch(oldVnode, vnode) {

  if (!oldVnode) {
    return createElm(vnode);  //如果没有el元素，那就直接根据虚拟节点返回真实节点
  }

  if (oldVnode.nodeType == 1) {
    // 用vnode来生成真实dom 替换原来的dom元素
    const parentElm = oldVnode.parentNode;  //找到他的父亲
    let elm = createElm(vnode); //根据虚拟节点，创建元素

    // 在第一次渲染后，删除节点，下次再使用无法获取
    parentElm.insertBefore(elm, oldVnode.nextSibling);

    parentElm.removeChild(oldVnode);
    return elm;
  } else {
    // 如果标签名不一样 直接删掉老的换成新的
    if (oldVnode.tag !== vnode.tag) {
      // 可以通过vnode.el属性，获取现在真实dom
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }

    // 如果标签名一样比较属性，传入新的虚拟节点，和老的属性，用新的属性更新
    let el = vnode.el = oldVnode.el;


    // 如果两个虚拟节点是文本节点，比较文本节点。。。
    if (vnode.tag == undefined) { //新老都是文本
      if (oldVnode.text !== vnode.text) {
        el.textContent = vnode.text;
      }
      return;
    }


    patchProps(vnode, oldVnode.data);
    // 属性可能有删除的情况

    // 一方有儿子，一方没儿子
    let oldChildren = oldVnode.children;
    let newChildren = vnode.children;

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 双方都有儿子
    } else if (newChildren.length > 0) {  //老的没儿子，新的有儿子
      for (let i = 0; i < newChildren.length; i++) {
        let child = createElm(newChildren[i]);
        el.appendChild(child);  //循环创建新节点
      }
    } else if (oldChildren.length > 0) {  //老的有儿子，新的没儿子
      el.innerHTML = ``;  //直接删除老节点
    }

    // Vue的特点是每个组件都有一个watcher，当前组件中的数据变化，只需要更新当前组件



  }
}

function patchProps(vnode, oldProps = {}) {  //初次渲染时，可以调用此方法，后续更新也可以调用此方法
  let newProps = vnode.data || {};
  let el = vnode.el;

  // 如果老的属性有，新的没有直接删除
  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};

  for (let key in oldStyle) {
    if (!newStyle[key]) { //新的里面不存在这个样式
      el.style[key] = '';
    }
  }

  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }

  for (let key in newProps) {
    if (key === 'style') {
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else {
      vnode.el.setAttribute(key, newProps[key]);
    }
  }
}

function createComponent(vnode) {
  let i = vnode.data; //vnode.data.hook.init
  if ((i = i.hook) && (i = i.init)) {
    i(vnode);  //调用init方法
  }
  if (vnode.componentInstance) {  //有属性说明子组件new完毕了，并且组件对应的真实DOM挂载到了componentInstance.$el
    return true;
  }
}

// 创建真实节点的
export function createElm(vnode) {
  let { tag, data, children, text, vm } = vnode;
  if (typeof tag === 'string') {  //元素
    if (createComponent(vnode)) {
      // 返回组件对应的真实节点
      return vnode.componentInstance.$el;
    };

    vnode.el = document.createElement(tag); //虚拟节点会有一个el属性，对应真实节点
    patchProps(vnode);
    children.forEach(child => {
      vnode.el.appendChild(createElm(child));
    })

  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}