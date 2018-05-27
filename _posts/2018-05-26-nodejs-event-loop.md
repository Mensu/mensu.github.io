---
layout: post
title: "Node.js 事件循环"
description: "Node.js 是如何与 V8、libuv 协作的"
subtitle: "node.js event loop"
create-date: 2018-05-27
update-date: 2018-05-27
header-img: ""
author: "Mensu"
tags:
    - Node.js
    - 个人理解
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

> 个人浅薄和粗糙的理解，忽略了大量细节，必有疏漏，仅供参考

# Node.js 与 V8、libuv 的协作

libuv 提供事件循环，并提供一些系统调用和 I/O 操作的函数（API）。这些 API 封装了相应的 I/O 操作，并可以通过多路复用等方式避免阻塞。I/O 操作完成后，下一轮事件循环（下一个 tick）调用传入 API 的回调函数。

V8 负责执行 JavaScript，并提供相应的 binding API，允许 JS 层的函数与 C++ 层的函数绑定。

Node.js 的主干是 C++ 的代码，大意如下：

~~~cpp
// 默认事件循环
auto loop = uv_default_loop();

v8Init();
// v8 实例
auto isolate = v8::Isolate::New(...);
// 上下文（global、builtin）
auto context = v8::Context::New(isolate, ...);

// 建立运行环境，例如：
// - 从命令行解析参数，保存各种选项，方便确定是要运行某个文件还是 REPL
// - 调用 V8 的 binding API 建立各种 binding，例如 global.process 对象
// - 往 libuv 默认事件循环注册各种 handle，例如注册 check 阶段的 handle 以实现 setImmediate
setupEnv(loop, isolate, context, ...);

// 编译并运行启动脚本
// 启动脚本里会通过 binding 调用 C++ 层的函数，进而可能调用 libuv 的 API，往事件循环注册 request 或 handle
auto script = v8::Script::Compile(context, source, ...).ToLocalChecked();
script->Run(context);

// 开始事件循环，调用相应 request 或 handle 的 C++ 回调函数
// 这些 C++ 回调函数一般会调用 JS 层传入的回调函数，将结果传回 JS 层
// 而 JS 回调函数可能会注册新的 request 或 handle，驱动事件循环的继续进行
uv_run(loop, ...);

cleanUp(...);
~~~

# Node.js API 与事件循环

libuv 的事件循环分为 7 个阶段

- timer
  * `setTimeout`
  * `setInterval`
  * 使用最小堆储存 handle，拿出来后就丢掉
- pending
  * 某些被故意推迟到下一个 tick 的回调函数，例如 socket、pipe 的某些 connect error
  * 使用队列储存 handle，拿出来后就丢掉
- idle
  * 如果有 `setImmediate` 的回调函数待处理，则注册 idle handle，使得事件循环不会卡在 poll 阶段，从而能够进入接下来的 check 阶段运行 `setImmediate` 的回调函数
  * 如果没有 `setImmediate` 的回调函数待处理，则不注册 idle handle，从而允许事件循环卡在 poll 阶段
  * 使用队列储存 handle，拿出来后会塞回队尾
- prepare
  * 开启 V8's CPU profiler
  * 使用队列储存 handle，拿出来后会塞回队尾
- poll
  * socket、pipe 等可以直接多路复用的
  * fs 等使用多线程通信的
  * 使用队列储存 handle
- check
  * `setImmediate`
  * 关闭 V8's CPU profiler
  * 使用队列储存 handle，拿出来后会塞回队尾
- close
  * 大部分 handle close 的 C++ 回调函数
  * 使用栈储存 handle，拿出来后就丢掉

为了避免 handle 过多导致频繁的 C++ 层与 JS 层切换，Node.js 会在 JS 层尽量合并回调函数，实现一个 C++ handle 回调时对应调用多个 JS 回调函数。

事件循环卡在 poll 阶段是指，满足一定条件时，poll 阶段会阻塞直到最近的 timer 生效。

## setTimeout / setInterval

每次调用时会在 JS 层将回调函数加入相同 timeout（多少毫秒后过期）的 `TimerList`。在第一个 `setTimeout` 或 `setInterval` 被调用时注册一个 timer handle 到事件循环，这个 handle 的回调函数负责从优先队列中得到过期的 `TimerList`，调用里面过期了的回调函数，并给 timer handle 定下新的超时时间或者 `unref`。在 [单例化 timer handle 的 PR](https://github.com/nodejs/node/pull/20555){:target="_blank"} 之前，每个 `TimerList` 会注册一个相应的 timer handle 到事件循环。`setInterval` 几乎可以看作是用 `setTimeout` 迭代实现的。

`unref` 意味着事件循环在判断是否要继续下一个 tick 和是否能卡在 poll 阶段时都不会考虑该 handle。

## setImmediate

每次调用时会在 JS 层将回调函数加入链表 `immediateList`。在 Node.js 启动时会有一个被 `unref` 的 check handle 注册到事件循环，这个 handle 的回调函数负责调用 `immediateList` 中的 JS 回调函数。

## process.nextTick

`process.nextTick` 并不是在下一轮事件循环调用回调函数。Node.js 一般是在 **每个 handle** 的 C++ 回调函数被触发，经过 JS 层的回调后回到 C++ 层，最终返回事件循环前，通过 `_tickCallback` 调用 tock 队列中的回调函数。

为方便解释，不妨看看下面的例子。监听了 `data` 事件，在回调函数中又注册了 `process.nextTick`、`setImmediate` 和 `setTimeout`

~~~javascript
const fs = require('fs')
// highWaterMark 设置成了要触发两次 data 事件的大小
const s1 = fs.createReadStream('README.md', { highWaterMark: 600 })
const s2 = fs.createReadStream('README.md', { highWaterMark: 600 })

s1.on('data', () => callback(1))
s2.on('data', () => callback(2))

function callback(id) {
  console.log('data', id)
  process.nextTick(() => console.log('process.nextTick', id))
  setImmediate(() => console.log('setImmediate', id))
  setTimeout(() => console.log('setTimeout', id))
}

~~~

可能的输出如下（虚线不是输出的一部分）。我们关心的是虚线中间的部分。每次读完文件数据，从 poll 阶段调用 Node.js 注册的 C++ 回调函数，C++ 回调函数再调用 JS 回调函数分发 `data` 事件。 JS 回调函数返回到 C++ 层之后，Node.js 就会运行 `_tickCallback` 调用 tock 队列中的回调函数。

~~~plain
data 1
process.nextTick 1
setImmediate 1
setTimeout 1
---------------------
data 2
process.nextTick 2
data 1
process.nextTick 1
setImmediate 2
setImmediate 1
---------------------
data 2
process.nextTick 2
setImmediate 2
setTimeout 2
setTimeout 1
setTimeout 2

~~~

由于两次读文件是两个不同的 handle 回调（更准确来说是 request），所以虚线中间表现出来的就是 `handle 回调` -> `nextTick` -> `handle 回调` -> `nextTick` 的顺序。而后面的两个 `setImmediate` 证明了上面两个 `handle 回调` 是在同一个 poll 阶段发生的。

这里想说的是，`process.nextTick` 不是在每个阶段结束时才执行回调函数的，而是在每个 handle 回调时。这包括 `setTimeout`、`setImmediate`、I/O 等的 handle。

当然，Node.js 还会在启动脚本加载完主模块等时机执行 `_tickCallback`。

## 微任务

微任务主要是指 `Promise` 的 `then`、`catch` 的回调函数，一般是在 `resolve` 和 `reject` 时由 V8 将微任务塞入微任务队列。

`_tickCallback`  清空完 tock 队列后，就会调用 V8 的接口执行微任务队列，然后循环这两步直到 tock 队列清空。也就是说微任务的执行其实也是 Node.js 控制的。

# 参考资料

- [修复 Node.js 官网文档中潜藏多年错误的 PR](https://github.com/nodejs/nodejs.org/pull/1603/files){:target="_blank"}
- [libuv 设计概览](http://docs.libuv.org/en/v1.x/design.html){:target="_blank"}
- [Node.js 源码](https://github.com/nodejs/node/blob/v10.2.1/src/node.cc){:target="_blank"}
- [libuv 源码](https://github.com/libuv/libuv/blob/v1.x/src/unix/core.c){:target="_blank"}
