---
layout: post
title: "Node.js 与 V8 addon"
description: "Node.js 如何与 V8 addon 协作"
subtitle: "node.js with v8 addon"
create-date: 2018-05-28
update-date: 2018-05-28
header-img: ""
author: "Mensu"
tags:
    - Node.js
    - 个人理解
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

> 个人浅薄和粗糙的理解，忽略了大量细节，必有疏漏，仅供参考

Node.js 允许我们编写 V8 addon，并通过 Node.js 模块的形式导入。我们可以编写 C++ 文件，并将我们写的 C++ 函数和 JS 对象绑定并作为模块的接口，这样便可以通过在 JS 层调用模块接口进入 C++ 层，执行我们写的 C++ 函数，发挥 C++ 层提供给我们的能力（例如开线程）。

# 从零开始

[搭建这样一个环境](https://github.com/nodejs/node-gyp#installation){:target="_blank"} 并不困难。在 Ubuntu 系统下的话，安装完 Node.js 就可以了。核心的文件结构如下：

~~~plain
.
├── main.cc
└── binding.gyp
~~~

其中，`binding.gyp` 文件的内容是一个 python 字典，`gyp` 根据这个文件生成 `Makefile`

~~~python
{
  "targets": [
    {
      "target_name": "my_addon",
      "sources": ["main.cc"],
      "cflags": ["-std=c++14", "-Wall", "-Wconversion"]
    }
  ]
}
~~~

`main.cc` 大概长这样

~~~cpp
#include <node.h>

// ModuleInit 这个名字可以自定义，会在 require 该模块时调用
static void ModuleInit(v8::Local<v8::Object> exports, v8::Local<v8::Value> module) {
  // 利用 v8 的 API 操作 exports 和 module 对象，添加属性或绑定 C++ 函数上去
  // ...
}

// module_name 好像没啥用...？最好还是和 target_name 一致吧
NODE_MODULE(module_name, ModuleInit);

~~~

接下来找到 `node-gyp` 进行编译。如果找不到 `node-gyp` 请看下一节。

~~~bash
node-gyp rebuild -d
~~~

如果编译通过，应该会生成 `build/Debug/my_addon.node` 文件。运行 node REPL，把它 require 进来就大功告成了

~~~bash
node
~~~

~~~js
addon = require('./build/Debug/my_addon')  // my_addon 是 .node 文件的文件名，可以省略 .node
~~~

### node-gyp

找不到 `node-gyp` 的话，可以考虑：

- `npm i -g node-gyp`
- 在 `package.json` 的 `scripts` 中调用 `node-gyp`

个人比较推荐第二个方案。可以用 `npm init -y` 新建一个 `package.json` 文件，然后把编译命令加入 `scripts`

~~~json
{
  "scripts": {
    "start": "node-gyp rebuild -d"
  }
}
~~~

这样就可以用 `npm start` 编译了。

如果希望访问 `node-gyp` 的其他功能，可以考虑再加一个 script

~~~json
{
  "scripts": {
    "start": "node-gyp rebuild -d",
    "gyp": "node-gyp"
  }
}
~~~

通过 `npm run gyp` 的方式使用，例如 `npm run gyp rebuild -- -d`

### bindings

`require('./build/Debug/my_addon')` 的导入方式写死了 `Debug` 和 `Release`，不太灵活。可以考虑使用一个叫 `bindings` 的库，然后这样导入：

~~~bash
addon = require('bindings')('my_addon')
~~~

# V8 基本概念

- `Isolate`：一个 V8 实例，包括堆内存、垃圾回收器什么的。一个 isolate 同一时间只能在一个线程执行 JS，否则会在新建 HandleScope 等时候出现段错误

- `Context`：表示一套 global、builtin 等，例如不同 iframe 用的就是不同的 context

- `Handle<T>`：像 `shared_ptr` 一样，负责包装某个对象，便于垃圾回收机制的运行。V8 对外开放的接口是它的两个子模板 `Local<T>` 和 `Persistent<T>`

- `HandleScope`：表示 handle 的作用域，同一时间只有一个 active 的作用域。析构时会减少挂在该作用域上的 `Local<T>` 的引用

- `Local<T>`：是 `Handle<T>` 的子模板，构造时会挂在当前 active 的作用域上增加引用。也有 API 可以让 `Local<T>` 逃逸到父作用域

- `Persistent<T>`：是 `Handle<T>` 的子模板，包装生命周期需要跨越 `HandleScope` 的对象，构造和析构时分别添加和减少对象的引用。在实现异步接口时经常需要用它保存 JS 传来的回调函数

- `Maybe`：例如 `MaybeLocal<T>` 某些应该返回 `T` 的接口，可能因为抛出了 JS 层的异常（但不是 C++ 层的异常）而得到空的 `T`。`Maybe` 这一层的目的就是强制要求检查相应的内容是否为空。空的话则不允许取出 `T`，否则 `MaybeLocal<T>` 便可以通过 `.ToLocalChecked()` 得到不为空的 `T`

- `Value`：大概继承关系是

  ~~~plain
  Data <- Value
      Value <- Object、Primitive
      	Object <- Function
          Primitive <- BigInt、Boolean、Name、Number
              Name <- String、Symbol
              Number <- Integer
                  Integer <- Int32、Uint32
  ~~~

  `null` 和 `undefined` 是 `Primitive`，通过 `Undefined(isolate)` 和 `Null(isolate)` 创建

# 异步接口

在 Node.js 中使用 V8 addon，可以解决一些计算密集型的任务：暴露一个异步接口给 JS 层调用，这个接口在 C++ 层开一个线程执行计算密集型的任务，任务完成后再将结果通过传入的回调函数传回 JS 层。

## 绑定 JS 函数和 C++ 函数

~~~cpp
// isolate 是很多 V8 API 要用到的
auto isolate = v8::Isolate::GetCurrent();
// 创建新的 v8::Local<T> 需要有一个 active 的 scope。如果能确保已经有了，则不必写这句。
v8::HandleScope scope(isolate);
// 就这么简单
auto js_function = v8::Function::New(isolate, cpp_function)
~~~

其中的 `cpp_function` 的签名必须是

~~~cpp
void cpp_function(const v8::FunctionCallbackInfo<v8::Value> &info);
~~~

唯一的参数 `info` 放的是和函数调用有关的信息，像参数 `info[i]`、参数数量 `info.Length()`、返回值 `info.GetReturnValue()` 等

例如一个简单的 `is_odd` 函数

~~~cpp
void is_odd(const v8::FunctionCallbackInfo<v8::Value> &info) {
  // V8 在执行这种绑定的回调函数时会帮我们预先创建好 scope，因此我们无需自己创建
  auto isolate = v8::Isolate::GetCurrent();
  // 首先要把 V8 对象转回 C++ 对象。这里忽略了各种类型检查
  auto number = info[0]->Int32Value();

  // 真正的密集计算逻辑
  auto result = number % 2 == 1;

  // 将结果从 C++ 对象转回 V8 对象
  auto ret = v8::Boolean::New(isolate, result);
  // 设置返回值
  info.GetReturnValue().Set(ret);
}
~~~

在模块初始化时绑定

~~~cpp
void ModuleInit(v8::Local<v8::Object> exports, v8::Local<v8::Value> module) {
  auto isolate = v8::Isolate::GetCurrent();

  // 调用 js_function 时，调用 C++ 层的 is_odd
  auto js_function = v8::Function::New(isolate, is_odd);

  auto key = v8::String::NewFromUtf8(isolate, "isOdd");
  // exports[key] = js_function
  exports->Set(key, js_function);
}
~~~

这样，在 JS 层就可以调用到绑定的 C++ 函数了

~~~js
const addon = require('bindings')('my_addon')
addon.isOdd(0)
addon.isOdd(1)
~~~

## 异步回调

异步需要注意几点。

- 同线程：必须在主线程（事件循环）上调用 JS 回调函数。
  - 因为 isolate 不是线程安全的，不要在多个线程同时操作 isolate。
  - 可以使用 libuv 的 API，将 C++ 回调函数注册到事件循环。
- 持久化：JS 回调函数需要用 `Persistent<Function>` 持久化。
  - 因为 `Local<Function>` 在调用绑定的 C++ 函数后，会随着相应 `HandleScope` 的析构而无效（例如，可能被垃圾回收）。
- 局部变量无效：使用 lambda 表达式时，要小心调用绑定的 C++ 函数时的局部变量，在**线程运行**和**事件循环回调函数执行**时可能已经无效。
  - 需要在线程访问的变量要考虑用 `new` 之类的分配到堆上。用 lambda 表达式的话，还可以考虑用**值捕获** `[=]`。

待填坑...
