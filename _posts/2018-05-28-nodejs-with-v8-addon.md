---
layout: post
title: "Node.js 与 V8 addon"
description: "Node.js 如何与 V8 addon 协作"
subtitle: "node.js with v8 addon"
create-date: 2018-05-28
update-date: 2018-06-02
header-img: ""
author: "Mensu"
tags:
    - Node.js
    - 个人理解
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

> 个人浅薄和粗糙的理解，忽略了大量细节，必有疏漏，仅供参考

Node.js 允许我们编写 V8 addon，并通过 Node.js 模块的形式导入。我们可以编写 C++ 文件，并将我们写的 C++ 函数和 JS 对象绑定，作为模块的接口，这样便可以通过在 JS 层调用模块接口进入 C++ 层，执行我们写的 C++ 函数，发挥 C++ 层提供给我们的能力（例如多线程）。

# 从零开始

[搭建 addon 开发环境](https://github.com/nodejs/node-gyp#installation){:target="_blank"}并不困难。在 Ubuntu 16.04 系统下，安装完 Node.js 就可以了。核心的文件结构如下：

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

// module_name 好像没啥用...？最好还是和 target_name 一致吧。module_name 不能用引号括起来
NODE_MODULE(module_name, ModuleInit);
~~~

接下来找到 `node-gyp` 进行编译。如果找不到 `node-gyp` 请看下一节。

~~~bash
node-gyp rebuild -d
~~~

如果编译通过，应该会生成 `./build/Debug/my_addon.node` 文件。运行 node REPL，把它 require 进来就大功告成了

~~~bash
node
~~~

~~~js
/* node REPL */
// my_addon 是 .node 文件的文件名，可以省略 .node
addon = require('./build/Debug/my_addon')
~~~

## node-gyp

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

## bindings

`require('./build/Debug/my_addon')` 的导入方式写死了 `Debug` 和 `Release`，不太灵活。可以考虑使用一个叫 `bindings` 的库，然后这样导入：

~~~js
/* node REPL */
addon = require('bindings')('my_addon')
~~~

# V8 基本概念

- `Isolate`：一个 V8 实例，包括堆内存、垃圾回收器什么的。一个 isolate 同一时间只能在一个线程上执行 JS，否则会在新建 `HandleScope` 等时候会被 abort 掉

- `Context`：表示一套 global、builtin 等，例如不同 iframe 用的就是不同的 context

- `Handle<T>`：像 `std::shared_ptr<T>` 一样，负责包装某个对象，便于垃圾回收机制的运行。V8 对外开放的接口是它的两个子模板 `Local<T>` 和 `Persistent<T>`

- `HandleScope`：表示 handle 的作用域。同一时间只有一个 active 的作用域。析构时会减少挂在该作用域上的 `Local<T>` 的引用

- `Local<T>`：是 `Handle<T>` 的子模板，构造时会挂在当前 active 的作用域上增加引用。也有 API 可以让 `Local<T>` 逃逸到父作用域

- `Persistent<T>`：是 `Handle<T>` 的子模板，包装生命周期需要跨越 `HandleScope` 的对象，构造和析构时分别添加和减少对象的引用。在实现异步接口时经常需要用它保存 JS 传来的回调函数

- `Maybe`：例如 `MaybeLocal<T>` ：某些应该返回 `Local<T>` 的接口，可能因为抛出了 JS 层的异常（但不是 C++ 层的异常）而得到空的 `Local<T>`（可以类比 `nullptr`）。这时 V8 就会让这些接口返回  `MaybeLocal<T>` 。`Maybe` 这一层的目的就是强制要求在使用前检查相应的内容是否为空。`MaybeLocal<T>` 为空的话则不允许取出 `Local<T>`，否则便可以通过 `.ToLocalChecked()` 得到不为空的（安全的） `Local<T>`

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

# 实现异步接口

在 Node.js 中使用 V8 addon，可以解决一些计算密集型的任务：暴露一个异步接口给 JS 层调用，这个接口在 C++ 层开一个线程执行计算密集型的任务，任务完成后再将结果通过传入的回调函数传回 JS 层。

## 绑定 JS 函数和 C++ 函数

~~~cpp
// isolate 是很多 V8 API 要用到的
auto isolate = v8::Isolate::GetCurrent();
// 创建新的 v8::Local<T> 需要有一个 active 的 scope。如果能确保已经有了，则不必写这句。
v8::HandleScope scope(isolate);
// 就这么简单
auto js_function = v8::Function::New(isolate, cpp_function);
~~~

其中的 `cpp_function` 的签名必须是

~~~cpp
void cpp_function(const v8::FunctionCallbackInfo<v8::Value> &info);
~~~

唯一的参数 `info` 存的是和函数调用有关的信息，像参数 `info[i]`、参数数量 `info.Length()`、返回值 `info.GetReturnValue()` 等

例如一个简单的 `is_odd` 函数

~~~cpp
void is_odd(const v8::FunctionCallbackInfo<v8::Value> &info) {
  // V8 在执行这种绑定的回调函数时会帮我们预先创建好 scope，此时我们才无需自己创建
  auto isolate = v8::Isolate::GetCurrent();
  // 首先要把 V8 对象转成 C++ 对象。这里忽略了各种类型检查
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
static void ModuleInit(v8::Local<v8::Object> exports, v8::Local<v8::Value> module) {
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

异步需要注意几点

- 同线程：必须在主线程（事件循环）上调用 JS 回调函数
  - 因为 isolate 不是线程安全的，不要在多个线程同时操作 isolate
  - 可以使用 libuv 的 API，将任务完成后的回调函数注册到事件循环
- 持久化：JS 回调函数需要用 `Persistent<Function>` 持久化
  - 因为 `Local<Function>` 在调用绑定的 C++ 函数后，会随着相应 `HandleScope` 的析构而无效（例如，指向的 JS 函数可能被垃圾回收而无效）
- 局部变量无效：使用 lambda 表达式时，要小心那些绑定的 C++ 函数的局部变量，在**线程运行**和**事件循环回调函数执行**时它们可能已经无效了
  - 需要在线程访问的变量要考虑用 `new` 之类的分配到堆上。用 lambda 表达式的话，还可以考虑用**值捕获** `[=]`



libuv 提供了其他线程与主线程通信的 API [`uv_async_t`](http://docs.libuv.org/en/v1.x/async.html){:target="_blank"}

~~~cpp
// 计算密集型的任务，在另一个线程运行
void number_crunching_work(uv_async_t *handle);

// 绑定到 JS 函数的异步接口
void async_api(const v8::FunctionCallbackInfo<v8::Value> &info) {
  /* ---------- 运行于事件循环主线程 ---------- */
  auto handle = new uv_async_t();
  // 保存整个异步任务所需要的数据，如输入参数、JS 回调函数
  handle->data = ...;

  // 初始化 async handle
  uv_async_init(uv_default_loop(), handle, [](uv_async_t *handle) {
    /* ---------- 在 uv_async_send 之后，运行于事件循环主线程 ---------- */
    // 从 handle->data 拿回异步任务结果、JS 回调函数等
    auto js_callback = ...;

    // 调用 JS 回调函数
    js_callback->Call(thisArg, argc, argv);

    // 取消注册 async handle
    uv_close(reinterpret_cast<uv_handle_t *>(handle), [](uv_handle_t *handle) {
      /* ---------- 取消注册完成后，运行于事件循环主线程 ---------- */
      // 释放内存
      delete handle->data;
      delete handle;
    });
  });

  // 在其他线程运行 number_crunching_work，传入 async handle
  std::thread(number_crunching_work, handle).detach();
}

void number_crunching_work(uv_async_t *handle) {
  /* ---------- 运行于其他线程 ---------- */
  // 从 async->data 拿回输入参数
  auto input = ...;

  // ... 密集计算任务 ...

  // 保存异步任务结果
  handle->data = ...;

  // 使得传入 uv_async_init 的回调函数在主线程运行。该 API 是线程安全的。
  // 虽然这里也能从 handle->data 拿到 JS 回调函数，但不能在主线程以外的线程直接执行
  uv_async_send(handle);
}
~~~

这样就可以把 `isOdd` 函数改造为异步的 `isOddAsync` 了。下面是完整的例子

~~~js
const addon = require('bindings')('my_addon')
addon.isOddAsync(0, console.log)
addon.isOddAsync(1, console.log)
~~~

~~~cpp
#include <chrono>
#include <node.h>
#include <thread>
#include <uv.h>

// 异步上下文，封装输入参数、JS 回调函数、执行结果、async handle
struct Context {
  std::int32_t number;
  v8::Persistent<v8::Function> cb;
  uv_async_t handle;
  bool result = false;

  Context(std::int32_t number, v8::Local<v8::Function> cb)
    : number(number), cb(cb->GetIsolate(), cb) {
    handle.data = this;
  }
};

void is_odd_async(const v8::FunctionCallbackInfo<v8::Value> &info) {
  /* ---------- 运行于事件循环主线程 ---------- */
  // 取出参数，将 V8 对象转成 C++ 对象。这里忽略了各种类型检查
  auto isolate = v8::Isolate::GetCurrent();
  auto number = info[0]->Int32Value();
  auto cb = info[1].As<v8::Function>();

  // 创建我们的异步上下文，保存整个异步任务所需要的数据
  auto ctx = new Context(number, cb);

  // 初始化 async handle
  uv_async_init(uv_default_loop(), &ctx->handle, [](uv_async_t *handle) {
    /* ---------- 在 uv_async_send 之后，运行于事件循环主线程 ---------- */
    // 从 handle->data 拿回异步上下文
    auto ctx = reinterpret_cast<Context *>(handle->data);

    // 这个回调函数是事件循环调用的，所以要记得手动创建 scope
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    // 这些是调用回调函数所需的参数，将 C++ 对象转回 V8 对象
    auto thisArg = isolate->GetCurrentContext()->Global();
    auto argc = 1;
    auto result = v8::Boolean::New(isolate, ctx->result);
    v8::Local<v8::Value> args[] = {result};

    // 调用 JS 回调函数
    auto cb = v8::Local<v8::Function>::New(isolate, ctx->cb);
    cb->Call(thisArg, argc, args);

    // 取消注册 async handle
    uv_close(reinterpret_cast<uv_handle_t *>(handle), [](uv_handle_t *handle) {
      /* ---------- 取消注册完成后，运行于事件循环主线程 ---------- */
      // 释放 ctx
      auto ctx = reinterpret_cast<Context *>(handle->data);
      delete ctx;
    });
  });

  // 在其他线程运行计算密集型的任务，通过值捕获来得到堆上的 ctx
  auto thread = std::thread([=]() {
    /* ---------- 运行于其他线程 ---------- */
    using namespace std::literals::chrono_literals;

    // 计算并保存异步任务结果
    ctx->result = ctx->number % 2 == 1;
    // 模拟密集计算的阻塞效果
    std::this_thread::sleep_for(2s);

    // 使得传入 uv_async_init 的回调函数在主线程运行
    uv_async_send(&ctx->handle);
  });
  // 不阻塞当前线程
  thread.detach();
}

static void ModuleInit(v8::Local<v8::Object> exports, v8::Local<v8::Value> module) {
  auto isolate = v8::Isolate::GetCurrent();
  // 调用 js_function 时，调用 C++ 层的 is_odd_async
  auto js_function = v8::Function::New(isolate, is_odd_async);
  auto key = v8::String::NewFromUtf8(isolate, "isOddAsync");
  exports->Set(key, js_function);
}

NODE_MODULE(module_name, ModuleInit);
~~~

# 最佳实践

## 头文件

可以考虑给编辑器提供 `node.h` 等头文件的路径来增强自动补全。

通过 `npm run gyp configure` 生成的 `build` 目录下有一个 `my_addon.target.mk` 文件，里面的 `INCS_Debug`、`INCS_Release` 变量便提供了头文件的所在路径。

另外，linux 下可以考虑 `/usr/include/node` 路径，nvm 用户还可以考虑 `$NVM_DIR/versions/node/版本/include/node`，但就要注意那些头文件的 API 是否和 `my_addon.target.mk` 文件一致了。

## 线程池

自己使用 `uv_async_t` 通信比较繁琐，而且无限制地开线程反而会对性能有影响。因此不妨考虑使用 libuv 提供的线程池 API `uv_queue_work`

~~~cpp
// 异步上下文，封装输入参数、JS 回调函数、执行结果、work handle
struct Context {
  std::int32_t number;
  v8::Persistent<v8::Function> cb;
  uv_work_t handle;
  bool result = false;

  Context(std::int32_t number, v8::Local<v8::Function> cb)
    : number(number), cb(cb->GetIsolate(), cb) {
    handle.data = this;
  }
};

void number_crunching_work(uv_work_t *handle);

void is_odd_async(const v8::FunctionCallbackInfo<v8::Value> &info) {
  /* ---------- 运行于事件循环主线程 ---------- */
  // 取出参数，将 V8 对象转成 C++ 对象。这里忽略了各种类型检查
  auto isolate = v8::Isolate::GetCurrent();
  auto number = info[0]->Int32Value();
  auto cb = info[1].As<v8::Function>();

  // 创建我们的异步上下文，保存整个异步任务所需要的数据
  auto ctx = new Context(number, cb);

  // 将 number_crunching_work 提交到线程池
  uv_queue_work(uv_default_loop(), &ctx->handle, number_crunching_work, [](uv_work_t *handle, int status) {
    /* ---------- 在工作线程结束后，运行于事件循环主线程 ---------- */
    // 这里忽略了 status < 0 时的处理
    // 从 handle->data 拿回异步上下文
    auto ctx = reinterpret_cast<Context *>(handle->data);

    // 这个回调函数是事件循环调用的，所以要记得手动创建 scope
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    // 这些是调用回调函数所需的参数，将 C++ 对象转回 V8 对象
    auto thisArg = isolate->GetCurrentContext()->Global();
    auto argc = 1;
    auto result = v8::Boolean::New(isolate, ctx->result);
    v8::Local<v8::Value> args[] = {result};

    // 调用 JS 回调函数
    auto cb = v8::Local<v8::Function>::New(isolate, ctx->cb);
    cb->Call(thisArg, argc, args);

    // 在这个回调里就可以释放 ctx 了。uv_work_t 没有关闭的操作
    delete ctx;
  });
}

void number_crunching_work(uv_work_t *handle) {
  /* ---------- 运行于其他线程 ---------- */
  using namespace std::literals::chrono_literals;
  // 从 handle->data 拿回异步上下文
  auto ctx = reinterpret_cast<Context *>(handle->data);

  // 计算并保存异步任务结果
  ctx->result = ctx->number % 2 == 1;
  // 模拟密集计算的阻塞效果
  std::this_thread::sleep_for(2s);
}
~~~

## 大数据输入输出

V8 对象与 C++ 对象的转换往往需要复制数据。若数据量比较大，数据的复制反而会影响性能，抵消掉多线程带来的性能提升。为克服这个问题，Node.js 提供了 `Buffer`，可以直接引用一段 C++ 层的内存，这段内存的访问不在 V8 的控制下，因此也没有同线程访问的要求。所以在数据量较大的时候，也可以考虑将数据序列化为 `Buffer` 作为 C++ 接口的输入输出，C++ 层便可以直接操纵那段 `Buffer` 内存而不必复制了。

## nan

全称是 [Native Abstractions for Node.js](https://github.com/nodejs/nan){:target="_blank"}，主要是为了填平 V8 和 Node.js 不同版本间的 API 差异。随着 V8 以及 Node.js 版本的不断迭代，V8 也在不断废弃旧 API 和引入新 API。为了能尽量让同样一份 C++ addon 能在不同版本的 Node.js 下编译，第三方库 `nan` 登上了历史舞台。它主要是通过条件编译，尝试填补不同 V8 间 API 的差距（类似于 web 前端常用的 polyfill 的作用）。另外，它还提供了许多方便的 API，代替原生 V8 和原生 Node.js API 的写法：例如统一的工厂 `Nan::New<T>(cpp_obj)` ，不必每次都传入 `isolate`。还有 `Nan::AsyncWorker` 抽象类，用面向对象的方式封装 `uv_queue_work` 的使用。

## N-API

[N-API](https://nodejs.org/api/n-api.html){:target="_blank"} 主要是为了将 addon 编程与具体的 JavaScript 解释器（V8）API 解耦，抽象出一层与解释器无关的 API。换句话说就是我们不再用具体的 V8 API 了，而是 Node.js 封装的 N-API 去做原本用 V8 API 完成的事。这是一套 C API（所以写起来不是很舒服...）

## 其他常用的 Node.js API

- `NODE_SET_METHOD(js_obj, "key", js_value)`
- `NODE_SET_PROTOTYPE_METHOD(js_obj, "key", js_value)`
- [`node::ObjectWrap`](https://nodejs.org/api/addons.html#addons_wrapping_c_objects){:target="_blank"}

# 参考资料

- [Writing Native Node.js Modules \| @RisingStack](https://blog.risingstack.com/writing-native-node-js-modules/){:target="_blank"}
- [C++ processing from Node.js - Part 4 - Asynchronous addons](https://nodeaddons.com/c-processing-from-node-js-part-4-asynchronous-addons/){:target="_blank"}
- [Using Buffers to share data between Node.js and C++ \| @RisingStack](https://community.risingstack.com/using-buffers-node-js-c-plus-plus/){:target="_blank"}
