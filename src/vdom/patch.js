export function patch(oldVnode, vnode) {
  if (oldVnode.nodeType == 1) {
    // 用vnode来生成真实dom 替换原来的dom元素
    const parentElm = oldVnode.parentNode;  //找到他的父亲
    let elm = createElm(vnode); //根据虚拟节点，创建元素

    // 在第一次渲染后，删除节点，下次再使用无法获取
    parentElm.insertBefore(elm, oldVnode.nextSibling);

    parentElm.removeChild(oldVnode);
    return elm;
  }
}

function createElm(vnode) {
  let { tag, data, children, text, vm } = vnode;
  if (typeof tag === 'string') {  //元素
    vnode.el = document.createElement(tag); //虚拟节点会有一个el属性，对应真实节点
    children.forEach(child => {
      vnode.el.appendChild(createElm(child));
    })
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}