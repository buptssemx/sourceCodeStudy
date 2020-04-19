import Observer from "./observe"
import Compile from "./compile"

class Vue {
  // options就是我们在vm实例化的时候，data methods那些
  constructor(options) {
    // 获取元素dom对象
    this.$el = document.querySelector(options.el)

    // 转存数据
    this.$data = options.data || {}

    // 数据和函数的代理
    this._proxyData(this.$data)
    this._proxyMethods(options.methods)

    // 数据劫持
    new Observer(this.$data)

    // 模板编译
    new Compile(this)
  }
  
  /**
   * 这段代码做的是数据代理 不代理的话访问数据得用vm.$data.msg 代理之后使用vm.msg就可以访问数据了
   * @param {*} data 
   */
  _proxyData(data) {
    Object.keys(data).forEach(key => {
      // 传递的this就是vm对象，相当于给vm添加key属性
      Object.defineProperty(this,key, {
        set(newValue) {
          data[key] = newValue
        },
        get() {
          return data[key]
        }
      })
    })
  }
  
  /**
   * 同上，不过这块代码是做的函数的代理
   * @param {*} methods 
   */
  _proxyMethods(methods) {
    if(methods && typeof methods === 'object') {
      Object.keys(methods).forEach(key =>{
        this[key] = methods[key]
      })
    }
  }
}
window.Vue = Vue
