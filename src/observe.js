import Dep from "./dep"

export default class Observer{
  constructor(data) {
    this.data = data
    // 遍历对象完成所有数据的劫持
    this.walk(this.data)
  }
  /**
   * 遍历对象
   * @param {*} data 
   */
  walk(data) {
    if(!data || typeof data !== "object") return 
    Object.keys(data).forEach(key => {
      this.defineReactive(data,key,data[key])
    })
  }
  /**
   * 动态响应式数据
   * @param {*} data 
   * @param {*} key 
   * @param {*} value 
   */
  defineReactive(data,key,value){
    let dep = new Dep()
    Object.defineProperty(data,key,{
      // 可遍历
      enumerable: true,
      // 可修改
      configurable: false,
      get: () => {
        // 保证每个数据都有一个依赖列表
        Dep.target && dep.addSubs(Dep.target)
        return value
      },
      set: newValue=> {
        console.log('set')
        value = newValue
        //  触发页面view变化
        dep.notify()
      }
    })
    this.walk(value)
  }
}