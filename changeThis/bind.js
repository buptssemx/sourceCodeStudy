Function.prototype.bind2 = function(context) {
  if(typeof this !== 'function') throw new TypeError('function needed')
  context = context?context:window
  const self = this
  let args = [...arguments].slice(1)
  let fn = function() {
    const bindArgs = [...arguments]
    return self.apply(context,args.concat(bindArgs))
  }
  return fn
}