import { initMixin } from "./init";
import { liftcycleMixin } from "./liftcycle";
import { renderMixin } from "./vnode/index";
import { initGlobalApi } from "./global-api/index";
import {stateMixin} from './initState'
import {compileToFunction} from './compiler/index'
import {createELm,patch} from './vnode/patch'
  function Vue(options){
    this._init(options)
  }
  //这些方法都是原型上的方法
  initMixin(Vue)  //给原型上添加一个  init 方法
  liftcycleMixin(Vue) //混合生命周期 渲染
  renderMixin(Vue)    // _render
  stateMixin(Vue)  // 给 vm 添加  $nextTick
  //静态方法  ，也是全局方法  Vue.component .Vue.extend Vue.mixin ..
    initGlobalApi(Vue);

    //创建vnode
    let vm1 = new Vue({data:{name:'张三'}})
    let render1 = compileToFunction(`<ul>
     <li>a</li>
     <li>b</li>
     <li>c</li>
    </ul>`)
    let vnode1 = render1.call(vm1)
     document.body.appendChild(createELm(vnode1))
   //数据更新
     let vm2 = new Vue({data:{name:'李四'}})
     let render2 = compileToFunction(`<ul>
     <li>a</li>
     <li>b</li>
     <li>c</li>
     <li>d</li>
    </ul>`)
     let vnode2 = render2.call(vm2)
     //patch 比对
      setTimeout(()=>{
        patch(vnode1,vnode2)
      },2000)
  export default Vue