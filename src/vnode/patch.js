export function patch(oldVnode, Vnode) {
    //原则  将虚拟节点转换成真实的节点
    //第一次渲染 oldVnode 是一个真实的DOM
    if (oldVnode.nodeType === 1) {
        // console.log(oldVnode, Vnode)  //注意oldVnode 需要在加载 mount 添加上去  vm.$el= el
        let el = createELm(Vnode) // 产生一个新的DOM
        let parentElm = oldVnode.parentNode //获取老元素（app） 父亲 ，body
        //   console.log(oldVnode)
        //  console.log(parentElm)
        //插入
        parentElm.insertBefore(el, oldVnode.nextSibling) //当前真实的元素插入到app 的后面
        parentElm.removeChild(oldVnode) //删除老节点
        //重新赋值
        return el
    }else{ //  diff
        console.log(oldVnode, Vnode)
         //1 元素不是一样 
         if(oldVnode.tag!==Vnode.tag){
          return  oldVnode.el.parentNode.replaceChild(createELm(Vnode),oldVnode.el) 
         }
         //2 标签一样 text  属性 <div>1</div>  <div>2</div>  tag:undefined
         if(!oldVnode.tag){
             if(oldVnode.text !==Vnode.text){
                 return   oldVnode.el.textContent = Vnode.text
             }
         }
         //2.1属性 (标签一样)  <div id='a'>1</div>  <div style>2</div>
         //方法 1直接复制
       let el = Vnode.el = oldVnode.el
       updataProps(Vnode,oldVnode.data)
       //diff子元素 <div>1</div>  <div></div>
       let oldChildren = oldVnode.children || []
       let newChildren = Vnode.children || []
       if(oldChildren.length>0&&newChildren.length>0){ //老的有儿子 新有儿子
              //创建方法
              updataChild(oldChildren,newChildren,el)
       }else if(oldChildren.length>0){//老的元素 有儿子 新的没有儿子
             el.innerHTML = ''
       }else if(newChildren.length>0){//老没有儿子  新的有儿子
             for(let i = 0;i<newChildren.length;i++){
                 let child = newChildren[i]
                 //添加到真实DOM
                 el.appendChild(createELm(child))
             }
       }
 
    }
}
function isSameVnode(oldContent,newContent) {
    return (oldContent.tag == newContent.tag) && (oldContent.key === newContent.key)
}
function updataChild(oldChildren, newChildren, parent) {
    // 1.创建双指针
    let oldStartIndex = 0//老的开头索引 
    let oldStartVnode = oldChildren[oldStartIndex]
    let oldEndIndex = oldChildren.length - 1
    let oldEndVnode = oldChildren[oldEndIndex]

    let newStartIndex = 0//新的开头索引
    let newStartVnode = newChildren[newStartIndex]//新的开始元素
    let newEndIndex=newChildren.length -1
    let newEndVnode = newChildren[newEndIndex]
    // 创建旧元素映射
    function makeIndexBykey(child) {
        let map = {}
        child.forEach((item, index) => {
            if (item.key) {
                map[item.key] = index
            }
        })
        return map
    }
    let map = makeIndexBykey(oldChildren)
    // 旧首节点和新首节点用 sameNode 对比。
    // 旧尾节点和新尾节点用 sameNode 对比
    // 旧首节点和新尾节点用 sameNode 对比
    // 旧尾节点和新首节点用 sameNode 对比
    // 如果以上逻辑都匹配不到，再把所有旧子节点的 key 做一个映射到旧节点下标的 key -> index 表，然后用新 vnode 的 key 去找出在旧节点中可以复用的位置。
    while (oldStartIndex <= oldEndIndex && newEndIndex <= newEndIndex) {
        if (isSameVnode(qldStartVnode, newStartVnode)) {
            //递归
            patch(oldStartVnode, newStartVnode)
            //移动指针
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        }else if (isSameVnode(oldEndVnode,newEndVnode)) {
            patch(oldStartVnode, newStartVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
            // 交叉比对
        }else if (isSameVnode(qldStartVnode, newEndVnode)) {
            patch(oldStartVnode, newEndVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        }else if (isSameVnode(oldEndVnode, newStartVnode)) {
            patch(oldEndVnode, newStartVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
            // 暴力比对
        } else {
            // 1.创建旧元素映射
            // 2.从旧的中寻找元素
            let moveIndex = map[newStartVnode.key]
            // 旧的没有
            if (moveIndex==undefined) {
                parent.insertBefore(createELm(newStartVnode), oldStartVnode.el)
                // 旧的有
            } else {
                let moveVnode = oldChildren[moveIndex] //获取到那个元素
                oldChildren[moveIndex] = null //防止数组塌陷
                parent.insertBefore(moveVnode.el, oldStartVnode.el)
                // 可能存在子项
                patch(moveVnode,newStartVnode)
            }
            // 新元素指针位移
            newStartVnode = newChildren[++newStartIndex]
        }
    }
    // 添加多余的节点
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i < newEndIndex; i++) {
            parent.appendChild(createELm(newChildren[i]))
        }
    }
    // 将老的多余元素去除
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i < oldEndIndex; i++) {
            //    注意null
            let child = oldChildren[i]
            if (child) {
                parent.removeChild(child.el)
            }
        }
    }

}
//添加属性
function updataProps(vnode,oldProps={}){ //第一次
  let newProps = vnode.data ||{} //获取当前新节点 的属性
  let el = vnode.el //获取当前真实节点 {}
  //1老的有属性，新没有属性
  for(let key in oldProps){
      if(!newProps[key]){
          //删除属性
          el.removeAttribute[key] //
      }
  }
  //2演示 老的 style={color:red}  新的 style="{background:red}"
   let newStyle = newProps.style ||{} //获取新的样式
   let oldStyle = oldProps.style ||{} //老的
   for(let key in oldStyle){
       if(!newStyle[key]){
           el.style =''
       }
   }
  //新的
  for(let key in newProps){
      if(key ==="style"){
         for(let styleName in newProps.style){
             el.style[styleName] =  newProps.style[styleName]
         }
      }else if( key ==='class'){
          el.className = newProps.class
      }else{
          el.setAttribute(key,newProps[key])
      }
  }
}
//vnode 变成真实的Dom
export function createELm(vnode) {
    let { tag, children, key, data, text } = vnode
    //注意
    if (typeof tag === 'string') { //创建元素 放到 vnode.el上
        vnode.el = document.createElement(tag)  //创建元素 
        updataProps(vnode)
        //有儿子
        children.forEach(child => {
            // 递归 儿子 将儿子渲染后的结果放到 父亲中
            vnode.el.appendChild(createELm(child))
        })
    } else { //文本
        vnode.el = document.createTextNode(text)
    }
    return vnode.el //新的dom
}

//思路 ：虚拟dom 变成正式的dom 
// 1获取到真实的dom  虚拟daom
// 2.将虚拟dom变成正式dom
// 3.获取到旧dom的父亲元素
// 4.将新的dom 方法 app 后面
// 5.删除 就的元素