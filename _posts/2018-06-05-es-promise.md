---
layout: post
title: "ES Promise"
description: "ES Promise 的工作机制的理解"
subtitle: "ES Promise"
create-date: 2018-06-05
update-date: 2018-10-03
header-img: ""
author: "Mensu"
tags:
    - JavaScript
    - 个人理解
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

> 个人浅薄和粗糙的理解，忽略了大量细节，必有疏漏，仅供参考

这里主要是介绍 Promise 的工作机制。数据结构的实现和标准并不一致。

# 工作机制

~~~javascript
const p = new Promise((resolve) => {
  // ...
  () => {
    resolve(result)
  }
  // ...
})

p.then(function onfulfilled(result) {
  // 得到 result
})
~~~

核心思想如上所示，用户在需要的时候（同步地/异步地）调用 Promise 提供的 `resolve` 函数传入 fulfill 的结果 `result`，然后内部就会安排调用用户通过 `.then` 注册的 onfulfilled 回调函数将 `result` 交回给用户。

## then

首先，`p.then` 一定会返回新的 Promise，得到如下的框架。

~~~javascript
Promise.prototype.then = function then(onfulfilled, onrejected) {
  const p = this
  const np = new Promise((resolve, reject) => {
    // TODO
  })
  return np
}
~~~

接着在 TODO 中，定义一个 `PromiseReactionJob`，负责 resolve 或 reject 掉返回的新 Promise。

~~~javascript
  // const np = new Promise((resolve, reject) => {
    // ...

    /**
     * @param {function} reaction - 用户传来的 onfulfilled 或 onrejected
     * @param {any} result - fulfill_result 或 reject_reason
     */
    function PromiseReactionJob(reaction, result) {
      try {
        // p.then(() => thenResult, () => thenResult)
        // 即 onfulfilled 和 onrejected 调用后的返回值
        const thenResult = reaction(result)
        // resolve 掉 .then 返回出去的 np
        resolve(thenResult)
      } catch (e) {
        // e 是 reaction(result) 抛出的异常
        // reject 掉 np
        reject(e)
      }
    }

    // ...
  // }
~~~

接着是 `.then` 的核心逻辑：如果 `p` 的状态是 `pending`，则将 `PromiseReactionJob` 加入 fulfill 和 reject 的回调函数列表暂时保存起来。

否则就将 `PromiseReactionJob` 直接加入微任务队列。

~~~javascript
Promise.prototype.then = function then(onfulfilled, onrejected) {
  const op = this
  const np = new Promise((resolve, reject) => {
    // 1. 看看 reaction 是否 callable，否的话就使用默认的
    if (!isCallable(onfulfilled)) onfulfilled = x => x
    if (!isCallable(onrejected)) onrejected = (e) => { throw e }

    // 2. 定义 PromiseReactionJob
    function PromiseReactionJob(reaction, result) { /* ... resolve or reject np ... */ }

    // 3. 加入回调函数列表/直接加入微任务队列
    if (op._state === 'pending') {
      op._fulfill_reactions.push(() => {
        // 等到 fulfill 时才将 PromiseReactionJob 加入微任务队列
        enqueueJob(() => PromiseReactionJob(onfulfilled, op._fulfill_result))
      })
      op._reject_reactions.push(() => {
        // 等到 reject 时才将 PromiseReactionJob 加入微任务队列
        enqueueJob(() => PromiseReactionJob(onrejected, op._reject_reason))
      })
    } else if (op._state === 'fulfilled') {
      // 直接将 PromiseReactionJob 加入微任务队列
      enqueueJob(() => PromiseReactionJob(onfulfilled, op._fulfill_result))
    } else if (op._state === 'rejected') {
      // 直接将 PromiseReactionJob 加入微任务队列
      enqueueJob(() => PromiseReactionJob(onrejected, op._reject_reason))
    }
  })
  return np
}
~~~

## resolve

`resolve` 函数传给用户，由用户决定什么时候（同步地/异步地）调用。用户调用时传入一个结果 `result`。

先给出构造函数的框架。

~~~javascript
class Promise {
  _state = 'pending'
  _fulfill_reactions = []
  _reject_reactions = []

  constructor(executor) {
    // 专门弄个 createResolvingFunctions 主要是为了
    // 给每对 reject、resolve 配一个 _already_resolved 变量
    const createResolvingFunctions = () => {
      let _already_resolved = false
      const reject = (reason) => {
        // TODO
      }
      const resolve = (result) => {
        // TODO
      }
      return { resolve, reject }
    }
    const rf = createResolvingFunctions()
    try {
      // executor 是用户 `new Promise(executor)` 时传进来的
      executor(rf.resolve, rf.reject)
    } catch (e) {
      rf.reject(e)
    }
  }
}
~~~

`resolve` 的逻辑是：如果 `result` 不是 thenable，则直接 fulfill 掉这个 Promise。

否则， `result` 就是 thenable，则要将 `PromiseResolveThenableJob` 加入微任务队列。**在 `PromiseResolveThenableJob` 中，才调用 `result.then` 注册该 thenable 的回调函数**

~~~javascript
// const createResolvingFunctions = () => {

  let _already_resolved = false
  const reject = (reason) => {
    // 防止重复调用
    if (_already_resolved) return
    _already_resolved = true

    // reject 掉自己
    return this._reject(reason)
  }
  const resolve = (result) => {
    // 防止重复调用
    if (_already_resolved) return
    _already_resolved = true

    // 不能 resolve 自己，会造成死循环
    if (result === this) return this._reject(new TypeError("selfResolutionError"))

    if (isThenable(result)) {
      // 将 PromiseResolveThenableJob 加入微任务队列
      // resolve 时并不调用 result.then
      const PromiseResolveThenableJob = () => {
        const rf = createResolvingFunctions()
        // 而是在 resolve 之后的微任务 PromiseResolveThenableJob 中才调用 result.then
        result.then(rf.resolve, rf.reject)
      }
      enqueueJob(() => PromiseResolveThenableJob())
      return
    }

    // is not thenable
    // 直接用 non-thenable resolve 掉自己
    return this._fulfill(result)
  }

  // return { resolve, reject }
// }
~~~

## \_fulfill、\_reject

主要做的事是调用之前注册的回调函数

~~~javascript
Promise.prototype._fulfill = function fulfill(result) {
  const { _fulfill_reactions } = this
  this._fulfill_result = result
  // 清空队列，防止内存泄漏
  this._fulfill_reactions = this._reject_reactions = undefined
  this._state = 'fulfilled'
  // 将 PromiseReactionJob 加入微任务队列
  _fulfill_reactions.forEach(reaction => reaction())
}
Promise.prototype._reject = function reject(reason) {
  const { _reject_reactions } = this
  this._reject_reason = reason
  // 清空队列，防止内存泄漏
  this._fulfill_reactions = this._reject_reactions = undefined
  this._state = 'rejected'
  // 将 PromiseReactionJob 加入微任务队列
  _reject_reactions.forEach(reaction => reaction())
}
~~~

## Promise.resolve

`new Promise(resolve => resolve(x))` 和 `Promise.resolve(x)` 有什么区别呢？

如果 x 的 constructor 不是 Promise，则二者可以看作是等价的

然而，当 x 的 constructor 是 Promise 时，即 `Reflect.getPrototypeOf(x)?.constructor === Promise`

- `new Promise(resolve => resolve(x))` 返回新的 Promise，而且新的 Promise 要等两轮微任务才会调用它的 `.then` 回调
- 而 `Promise.resolve(x) === x`

## Promise.reject

这个就没那么多事了，直接有

- `Promise.reject(x)` 与 `new Promise((_, reject) => reject(x))` 等价
- `Promise.reject(x).catch(reason => x === reason)`

## catch

~~~javascript
Promise.prototype.catch = function catch_(onrejected) {
  return this.then(undefined, onrejected)
}
~~~

## finally

- 会等待 `onfinally()` resolve
- 无法改变返回值（与 `finally` 语句不同）
- 无法阻止抛出异常
- 可以抛出新异常覆盖原异常

~~~javascript
Promise.prototype.finally = function finally_(onfinally) {
  const onfulfilled = onfinally
  const onrejected = onfinally
  if (isCallable(onfinally)) {
    onfulfilled = result => Promise.resolve(onfinally()).then(_ => result)
    onrejected = reason => Promise.resolve(onfinally()).then((_) => { throw reason })
  }
  return this.then(onfulfilled, onrejected)
}
~~~



# 推论与应用

## 推论

- `const np = p.then(function cb() { return ret })` 中，回调函数 `cb()` 返回后，才调用 `np.resolve(ret)`
- 顺序是 `fulfill p` -> `call cb` -> `fulfill p.then() using cb()'s ret`
- `p.resolve(nonPendingThenable)` 时，要间隔 2 轮微任务（在第 3 轮）才调用 `p.then` 注册的回调函数
  - `p.resolve(nonThenable)` 和 `p.reject(x)` 时不需要隔微任务，下一轮就调用 `p.then` 注册的回调函数了
- `p.then((x) => { ... }, (y) => {...})` 中，`x` 即 `p._fulfill_result` 不可能是 thenable
  - 因为 `_fulfill_result` 的值只在 `p._fulfill(result)` 中设置，而 `p._fulfill(result)` 只在 `resolve` 中的 `result` 不是 thenable 时才会调用
  - `y` 就不一样了：它可以是 thenable

## 链式调用

链式调用的实现在 `.then` 中的 `PromiseReactionJob`，通过在原 Promise 的回调函数中调用新 Promise 的 `resolve`、`reject`，将原 Promise 的状态传给新 Promise。

例如

~~~javascript
Promise.resolve()
  .then(() => { throw e })
  .then(() => 1)
  .then(() => 2)
  .catch(() => 3)
  .then(() => 4)
~~~

实际上是

~~~javascript
Promise.resolve()                      // [1]
  .then(() => { throw e })             // [2]
  .then(() => 1, (e) => { throw e })   // [3]
  .then(() => 2, (e) => { throw e })   // [4]
  .catch(() => 3)                      // [5]
  .then(() => 4)                       // [6]

  // .then(onfulfilled, onrejected)
  // .catch(onrejected)
~~~

也就是说，[2] 的 onfulfilled 中主动抛出异常，将 [2] 返回的 Promise reject 掉，调用了注册在那上面的 [3] 的 onrejected，即 `(e) => { throw e }`，继续抛异常将 [3] 返回的 Promise reject 掉，调用了注册在那上面的 [4] 的 onrejected，继续抛异常将 [4] 返回的 Promise reject 掉，调用了注册在那上面的 [5] 的 onrejected，正常返回了数字 3 将 [5] 返回的 Promise fulfill 掉，调用了注册在那上面的 [6] 的 onfulfilled，正常返回了数字 4 将 [6] 返回的 Promise fulfill



## Node 8 vs Firefox

下面的代码输出什么？来源：[Holding on to your Performance Promises (Node Collaborator Summit Berlin May '18) - Google Slides](https://docs.google.com/presentation/d/1c97oyNvt8FfTjCNkcGUkWUYopCWNBBVlunJgFnINk70/edit#slide=id.g3ae050c874_0_4){:target="_blank"}

~~~javascript
function log(v) {
  console.log(`log(${v})`);
  return Promise.resolve(undefined);
}

async function countTo(k) {
  for (let i = 0; i < k; ++i) await log(i);
}

function tick(v) {
  console.log(`Tick ${v}…`);
  if (v > 0) Promise.resolve(v - 1).then(tick);
}

tick(10);
countTo(4);
~~~

Node 8 输出如下

~~~plain
Tick 10…
log(0)
Tick 9…
log(1)
Tick 8…
log(2)
Tick 7…
log(3)
Tick 6…
Tick 5…
Tick 4…
Tick 3…
Tick 2…
Tick 1…
Tick 0…
~~~

Firefox 输出如下

~~~plain
Tick 10…
log(0)
Tick 9…
Tick 8…
Tick 7…
log(1)
Tick 6…
Tick 5…
Tick 4…
log(2)
Tick 3…
Tick 2…
Tick 1…
log(3)
Tick 0…
~~~

谁是对的？Firefox 是对的。为什么？

先看下面的代码：

~~~javascript
const p0 = Promise.resolve(1)
const p1 = new Promise(resolve => resolve(p0))
const p2 = p1.then(console.log)
~~~

根据上面的工作机制可知，要等到第 3 轮微任务才会调用 `console.log`：

- `new` 时的 `resolve` 将微任务 `PromiseResolveThenableJob` 加入队列
- 第 1 轮微任务 `PromiseResolveThenableJob` 执行 `p0.then(rf.resolve)` ，由于 `p0` 不是 `pending`，所以将微任务 `PromiseReactionJob(rf.resolve, p0._fulfill_result)` 加入队列
- 第 2 轮微任务 `PromiseReactionJob` 执行 `reaction(p0._fulfill_result)`，即 `rf.resolve(p0._fulfill_result)`。`p0._fulfill_result` 是 `1` 不是 thenable，那就变成 `p1._fulfill(p0._fulfill_result)`，也就是把 p1 用 `p0._fulfill_result` 给 fulfill 了。
  - p1 fulfill 时，会调用 `p1._fulfill_reactions` 里保存的回调函数，将微任务 `PromiseReactionJob(console.log, p1._fulfill_result)` 加入微任务队列。
  - 此后还会把 `reaction(p0._fulfill_result)` 的返回值 `undefined` 交给 `resolve`，但这个 `resolve` fulfill 的是 `p0.then()` 返回的 Promise。鉴于这个返回的 Promise 没有继续 then 下去，在这里可以忽略它的影响
- 第 3 轮微任务 `PromiseReactionJob` 执行 `reaction(p1._fulfill_result)`，即 `console.log(p1._fulfill_result)`。
  - 此后还会把 `reaction(p1._fulfill_result)` 的返回值 `undefined` 交给 `resolve`，这个 `resolve` fulfill 的是 `p1.then()` 返回的 `p2`

另一方面， `async` 函数实质上是 `Promise` 和生成器函数的语法糖（忽略一些异常处理的细节）

~~~javascript
await log(i)
=> await Promise.resolve(i)
=> yield Promise.resolve(i)
=> {
  // yield Promise.resolve(i) 时，it.next() 返回 Promise.resolve(i)
  const result = it.next()
  new Promise(resolve => resolve(result)).then(val => it.next(val))  // it.next(val) 标志着 yield 返回
}
=> {
  // 令 p0 = result = Promise.resolve(i)，标志着开始 await
  const p0 = Promise.resolve(i)
  // 拆成 p1、p2
  const p1 = new Promise(resolve => resolve(p0))  // [1]
  // it.next(val) 标志着 await 返回
  const p2 = p1.then(val => it.next(val))
}
~~~

步骤 [1] 是标准要求的，参见 [Await 算法](https://tc39.github.io/ecma262/#await){:target="_blank"} 的第 2、3 步。

所以，从 `p0`、`p1`、`p2` 完成定义注册好回调函数，到 `it.next(val)` 的调用，即从 `log(i)` 开始被 `await`，到 `await log(i)` 表达式整个返回，应该要间隔 2 轮微任务才对。由此可见，Firefox 先打出 `log(0)`，然后间隔 2 轮微任务后再打出 `log(1)`，才符合标准。

Node 8 的输出是因为当时的 V8 在 `new Promise(resolve => resolve(p0))` 时，看到 `p0` 是 fulfilled 了，就直接把返回的 `new Promise(resolve => resolve(p0))` 给 fulfilled 了，结果弄巧成拙，不合标准。

> 不过在 2018 年 7 月的 tc39 会议上，有人指出了 3 轮微任务的问题，[认为应该采用 Node 8 的做法，改成 1 轮微任务](https://github.com/tc39/tc39-notes/blob/master/es9/2018-07/july-25.md#reduce-the-number-of-ticks-in-asyncawait){:target="_blank"}

# 参考资料

- [ECMAScript® 2019 Language Specification](https://tc39.github.io/ecma262/#sec-promise-objects){:target="_blank"}
- [Holding on to your Performance Promises (Node Collaborator Summit Berlin May '18) - Google Slides](https://docs.google.com/presentation/d/1c97oyNvt8FfTjCNkcGUkWUYopCWNBBVlunJgFnINk70/edit#slide=id.p){:target="_blank"}
