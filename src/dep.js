export default class Dep{
  constructor() {
    // 存放所有wacher
    this.subs = []
  }
  
  /**
   * 添加watcher
   * @param {*} target 
   */
  addSubs(target) {
    this.subs[target.uid] = target
  }
  
  /**
   * 通知所有的watcher进行视图更新
   */
  notify() {
    for(let uid in this.subs) {
      this.subs[uid].update()
    }
  }
}