Funciton.prototype.myCall = function(context) {
  context = context?context:window
  let fn = Symbol()
  context[fn] = this
  let args = [...arguments].slice(1)
  const result = context[fn](...args)
  delete context[fn]
  return result
}

Function.prototype.myApply = function(context,arr) {
  if(!Array.isArray(arr)) throw new TypeError('参数得是数组')
  context = context?context:window
  let fn = Symbol()
  context[fn] = this
  let args = [...arguments].slice(1)
  const result = context[fn](args)
  delete context[fn]
  return result
}