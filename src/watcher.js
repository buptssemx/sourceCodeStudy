import Dep from "./dep"

// 因为会有多个watcher，所有赋予单独的变量uid，每new一个watcher就加加
var $uid =0  
export default class Watcher {
  constructor(exp,scope,cb) {
    this.exp = exp
    this.scope = scope
    this.cb = cb
    this.uid = $uid++
    this.update()
  }

  /**
   * 计算表达式
   */
  get() {
    // 类的静态变量只能有一个
    // 执行表达式的时候一定会监测到observe的get方法，所以在这里把Dep.target赋值，然后在get监听方法中添加依赖
    Dep.target = this
    let newValue = Watcher.computeExp(this.exp,this.scope)
    Dep.target = null
    return newValue
  }
  
  /**
   * 完成回调函数的调用
   */
  update() {
    let newValue = this.get()
    this.cb&&this.cb(newValue)
  }
  
  /**
   * 计算表达式的值
   * @param {*} exp 
   * @param {*} scope 
   */
  static computeExp(exp,scope) {
    // 创建函数
    // 把scope当做作用域
    // 函数内部使用with来指定作用域
    // 执行函数，得到表达式的值
    let fn = new Function("scope","with(scope){return "+exp+"}")
    return fn(scope)
  }
}