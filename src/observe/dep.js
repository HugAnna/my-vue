let id = 0
class Dep {
    constructor() {
        this.subs = []
        this.id = id++
    }
    //收集watcher 
    depend() {
      
        //我们希望water 可以存放 dep
        //实现双休记忆的，让watcher 记住
        //dep同时，让dep也记住了我们的watcher
        Dep.target.addDep(this)
        // this.subs.push(Dep.target) // id：1 记住他的dep
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    //更新
    notify() {
        // console.log(Dep.target)
        this.subs.forEach(watcher => {
            watcher.updata()
        })
    }
}

//dep  和 watcher 关系
Dep.target = null;
// 处理多个watcher
let stack = []
export function pushTarget(watcher) {  //添加 watcher

    Dep.target = watcher //保留watcher
    // 入栈
    stack.push(watcher)
}
export function popTarget() {
    // Dep.target = null //将变量删除
    // 解析完一个watcher,就删除一个
    stack.pop()
    // 获取到前一个watcher
    Dep.target =stack[stack.length - 1]
}
export default Dep
 //多对多的关系
 //1. 一个属性有一个dep ,dep 作用：用来收集watcher的
 //2. dep和watcher 关系：(1)dep 可以存放多个watcher  (2):一个watcher可以对应多个dep