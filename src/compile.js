import Watcher from "./watcher"

export default class Compile {
  constructor(context) {
    // console.log(context)
    this.$el = context.$el
    this.context = context
    if(this.$el) {
      // 原始的dom转换为文档片段
      this.$fragment = this.nodeToFragment(this.$el)
      // 编译模板
      this.compile(this.$fragment)
      // 把文档片段添加到页面中
      this.$el.appendChild(this.$fragment)
    }
  }
  
  /**
   * 模板编译
   * @param {*} node 
   */
  compile(node) {
    if(node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if(child.nodeType === 1) {
          //当时元素节点
          this.compileElementNode(child)
        } else if(child.nodeType === 3) {
          // 文本节点
          this.compileTextNode(child)
        }
      })
    }
  }

  /**
   * 编译元素节点
   * @param {*} node 
   */
  compileElementNode(node) {
    let that = this
    let attrs = [...node.attributes]
    attrs.forEach(attr => {
      let {name: attrName, value : attrValue} = attr
      if (attrName.indexOf('v-') === 0) {
        let dirName = attrName.slice(2)
        switch(dirName) {
          case 'text' :
            new Watcher(attrValue,this.context,newValue=>node.textContent=newValue)
            break
          case 'model' :
            new Watcher(attrValue,this.context,newValue=>{
              node.value = newValue
            })
            node.addEventListener('input', e=> {
              that.context[attrValue] = e.target.value
            })
            break
        }
      }
      if(attrName.indexOf('@') === 0) {
        this.compileMethods(this.context,node,attrName,attrValue)
      }
    })
    this.compile(node)
  }

  /**
   * 编译文本节点
   * @param {*} node 
   */
  compileTextNode(node) {
    let text = node.textContent.trim()
    if(text) {
      // 把text字符串转化成表达式
      let exp = this.parseTextIntoExp(text)
      // 添加订阅者，计算表达式的值
      // 当表达式依赖的数据发生变化时
      // 1.重新计算表达式的值
      // 2.node.textContent为最新的值
      // 完成 modle->view的响应式

      // context传递的是作用域，及要改变的是哪个节点的值
      new Watcher(exp,this.context,(newValue)=> {
        node.textContent = newValue
      })
    }
  }
  
  /**
   * 函数编译
   * @param {*} scope 
   * @param {*} node 
   * @param {*} attrName 
   * @param {*} attrValue 
   */
  compileMethods(scope,node,attrName,attrValue) {
    // 获取类型 判断@后面是click还是keyup
    let type = attrName.slice(1)
    let fn = scope[attrValue]
    node.addEventListener(type,fn.bind(scope))
  }
  
  /**
   * 将文本转化成表达式
   * 111{{msg+'---}} 222
   * 111+ msg +'---'+222
   * @param {*} text 
   */
  parseTextIntoExp(text) {
    // 匹配插值表达式
    let reg = /\{\{(.+?)\}\}/g
    // 分割插值表达式前后内容
    let pieces = text.split(reg)
    // 匹配插值表达式
    let matches = text.match(reg)
    // 表达式数组
    let tokens = []
    pieces.forEach(item => {
      if(matches && matches.indexOf('{{'+ item +'}}')>-1) {
        tokens.push('('+ item + ')')
      } else {
        tokens.push('`' + item + '`')
      }
    })
    return tokens.join('+')
  }

  /**
   * 把所有元素转为文档片段，这样不直接操作dom，节省性能
   * 具体用法参见 https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createDocumentFragment
   * @param {*} node 
   */
  nodeToFragment(node) {
    let fragment = document.createDocumentFragment()
    if(node.childNodes && node.childNodes.length) {
      // childNodes获取所有子节点 具体用法参见 https://developer.mozilla.org/zh-CN/docs/Web/API/Node/childNodes
      node.childNodes.forEach(child => {
        // 判断是不是我们需要的节点
        // 如果是注释节点或者不必要的换行就不添加了
        if(!this.ignorable(child)) {
          fragment.appendChild(child)
        }
      })
    }
    return fragment
  }

  /**
   * 忽略哪些节点不加到文档片段中
   * @param {*} node 
   */
  ignorable(node) {
    var reg = /^[\t\n\r]+/
    // nodeType: 节点类型 具体参考https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
    return (node.nodeType === 8 || (node.nodeType===3&&reg.test(node.textContent))) 
  }
}