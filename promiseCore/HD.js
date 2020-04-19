class HD {
  static PENDING = 'pending'
  static FULLFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  /**
   * 初始化状态
   */
  constructor(executor) {
    this.status = HD.PENDING
    this.value = null
    this.callbacks = []
    // 错误处理统一reject掉
    try{
      // 此处使用bind是因为不bind当前this的话this将会是window
      executor(this.resolve.bind(this),this.reject.bind(this))
    } catch(err){
      this.reject(err)
    }
  }

  /**
   * promise解决时的函数
   * @param {*} value 
   */
  resolve(value) {
    // 保证状态一旦被更改就无法再次修改
    if(this.status === HD.PENDING) {
      this.status = HD.FULLFILLED
      this.value = value
      setTimeout(()=> {
        this.callbacks.map(callback=> {
          callback.onFulfilled(value)
        })
      })
    }
  }

  /**
   * promise拒绝时的函数
   * @param {*} reason 
   */
  reject(reason) {
    if(this.status === HD.PENDING) {
      this.status = HD.REJECTED
      this.value = reason
      // pending状态时先放入callback数组，然后执行callback里的函数
      // 添加定时器保证是异步的
      setTimeout(()=> {
        this.callbacks.map(callback=> {
          callback.onRejected(reason)
        })
      })
    }
  }

  /**
   * promise then方法
   * @param {*} onFulfilled 
   * @param {*} onRejected 
   */
  then(onFulfilled,onRejected) {
    // 因为promise then方法中成功和失败函数是可传可不传的，所以在此处进行判断，自己构造一个空函数
    // if(typeof onFulfilled!=='function') {
    //   onFulfilled = () =>{}
    // }
    // if(typeof onRejected!== 'function') {
    //   onRejected = () => {}
    // }

    // 解决.then()这种情况链式无法继续
    if(typeof onFulfilled!=='function') {
      onFulfilled = () =>this.value
    }
    if(typeof onRejected!== 'function') {
      onRejected = () => this.value
    }
    // then方法还是会返回一个promise
    let promise =  new HD((resolve,reject)=>{
      // pending状态的处理
      // 添加错误处理
      if(this.status === HD.PENDING) {
        this.callbacks.push({
          onFulfilled:value=>{
            try{
              let result = onFulfilled(value)
              if(result === promise) {
                throw new TypeError('chaining cycle detected')
              }
              if(result instanceof HD) {
                result.then(value=> {
                  resolve(value)
                },reason=>{
                  reject(reason)
                })
              } else {
                resolve(result)
              }
            } catch(error) {
              // 解决新promise状态是reject的情况
              // 非链式时调用的是onRejected
              reject(error)
            }
          },
          onRejected:reason=>{
            try{
              let result = onRejected(reason)
              if(result === hd2) {
                throw new TypeError('chaining cycle detected')
              }
              if(result instanceof HD) {
                result.then(value=> {
                  resolve(value)
                },reason=>{
                  reject(reason)
                })
              } else {
                resolve(result)
              }
            } catch(error) {
              reject(error)
            }
          }
        })
      }
      // 保证前面状态改变之后再执行then函数
      if(this.status === HD.FULLFILLED) {
        // then函数中执行的代码是异步的
        setTimeout(()=>{
          try{
            // 链式操作中返回一个新的promise，需要改变状态来保证新的promise可以执行then方法
            // then方法默认的状态是解决的
            // 判断是否是自己返回了一个promise
            // 保证下一个promise可以接到上一个promise的返回值
            let result = onFulfilled(this.value)
            if(result === promise) {
              throw new TypeError('chaining cycle detected')
            }
            if(result instanceof HD) {
              // result.then(value=> {
              //   resolve(value)
              // },reason=>{
              //   reject(reason)
              // })
              // 上面代码简写形式
              result.then(resolve,reject)
            } else {
              resolve(result)
            } 
          } catch(error) {
            reject(error)
          }
        })
      }
      if(this.status === HD.REJECTED) {
        setTimeout(()=> {
          try{
            let result = onRejected(this.value)
            if(result instanceof HD) {
              result.then(value=> {
                resolve(value)
              },reason=>{
                reject(reason)
              })
            } else {
              resolve(result)
            }
          } catch(error) {
            reject(error)
          }
        })
      }
    })
    return promise
  }

  /**
   * 静态方法resolve
   * @param {*} value 
   */
  static resolve(value) {
    return new HD((resolve,reject) => {
      if(value instanceof HD) {
        value.then(resolve,reject)
      }
      else {
        resolve(value)
      }
    })
  }

  /**
   * 静态方法reject
   * @param {*} reason 
   */
  static reject(reason) {
    return new HD((resolve,reject)=> {
      reject(reason)
    })
  }

  /**
   * 静态方法all 全部解决才返回
   * @param {*} promises 
   */
  static all (promises) {
    let resolvedPromise = []
    return new HD((resolve,reject) => {
      promises.forEach(promise=> {
        promise.then(value =>{
          resolvedPromise.push(value)
          if(resolvedPromise.length === promises.length) {
            resolve(resolvedPromise)
          }
        }, reason => {
          reject(reason)
        })
      })
    })
  }
  
  /**
   * 静态方法race 谁快用谁
   * @param {*} promises 
   */
  static race(promises) {
    return new HD((resolve,reject) => {
      promises.map(promise=> {
        promise.then(value=>{
          resolve(value)
        },reason=> {
          reject(reason)
        })
      })
    })
  }
}