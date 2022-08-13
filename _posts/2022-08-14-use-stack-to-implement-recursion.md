---
layout: post
title: "函数的非递归实现方法"
description: ""
subtitle: "use a stack to implement recursion"
create-date: 2022-08-14
update-date: 2022-08-14
header-img: ""
author: "Mensu"
tags:
    - 数据结构
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%-d" }}**.

# 栈的基本功能

这里简单回顾下栈的基本功能。栈可以用来实现 “后进先出” 的功能。C++ 函数嵌套调用中，最后调用的函数会最先处理完毕（return），因此很适合用栈来实现。

# 例子

举个简单的例子，我想打印 0、1、2 的所有排列，思路是在每个位置把 0 到 2 都循环一遍，如果前面的位置没用过，则在这个位置使用它，同时记录它已经用过了；如果前面的位置用过了，则继续循环看下一个数字。这样的思路写出来的递归函数是这个样子的：

~~~cpp
constexpr size_t length = 3;
bool isUsed[length] = {};
size_t arr[length] = {};

void printArr();

void printArrangement(size_t curIndex) {
  for (size_t i = 0; i < length; i += 1) {
    if (isUsed[i]) {
      continue;
    }
    isUsed[i] = true;
    // 要打印的数字记录到 arr 里
    arr[curIndex] = i;

    if (curIndex + 1 == length) {
      // 已经是最后一个数字了，开始打印
      printArr();
    } else {
      // 继续收集下一位要打印的数字
      printArrangement(curIndex + 1);
    }

    isUsed[i] = false;
  }
}

void printArr() {
  for (size_t i = 0; i < length - 1; i += 1) {
    std::cout << arr[i] << " ";
  }
  std::cout << arr[length - 1] << std::endl;
}
~~~

如果想自己用栈来模拟这样的递归，我们就需要用到类似汇编编程的思维：
- 用类似 jump 指令的思想实现包含递归调用的条件分支、循环
- 在递归调用前后，存储和恢复当前这次函数调用的变量

# 实现方法

## 整体代码结构 - 两层循环
- 外层循环：每轮循环代表一次新的函数调用
  - 用栈保存一次函数调用的上下文变量 ctx
  - 调用函数：push 函数 ctx
  - 函数返回：pop 函数 ctx
  - 栈里没有函数 ctx 时，说明最外层递归结束
- 内层循环：实现分支跳转
  - 用 switch case 实现跳转点
  - 跳转：修改 switch 跳转点变量 + break 出 switch
  - 调用函数/函数返回：break 出循环

函数中需要跨跳转点的变量都需要放到 ctx 里。

~~~cpp
std::stack<Context> stack;
auto ret;
stack.push(Context(ret));
while (!stack.empty()) {
  Context &ctx = stack.top();

  bool shouldSwitchStack = false;
  while (!shouldSwitchStack) {
    switch (ctx.jumpTo) {
      case 0: {
        // 常规跳转：条件分支 / 循环
        ctx.jumpTo = 2;
        break;
      }
      case 1: {
        // 返回点
        ctx.jumpTo = 2;
        // 递归调用，返回值放到 ctx.ret1 表示调用方收到的返回值
        // 这里传入引用，比如 Context(auto &ret): ret(ret) {}
        stack.push(Context(ctx.ret1));
        shouldSwitchStack = true;
        break;
      }
      case 2: {
        // 调用方可从 ctx.ret1 拿返回值
        use(ctx.ret1);
        // 被调用方函数返回，设置 ctx.ret 可以改变调用方传来的引用
        ctx.ret = xxx;
        stack.pop();
        shouldSwitchStack = true;
        break;
      }
    }
  }
}
~~~

两层循环的结构是相对固定的，而内层循环的 switch case 跳转点需要根据实际代码设计。

## 普通递归调用

调用后会分割出一个跳转点。

~~~cpp
void recursive() {
  // case 0:
  aaa;
  recursive();

  // case 1:
  bbb;
}

// ===>

while (!shouldSwitchStack) {
  switch (ctx.jumpTo) {
    case 0: {
      aaa;
      // 返回到 1
      ctx.jumpTo = 1;
      // 递归调用
      stack.push(Context());
      shouldSwitchStack = true;
      break;
    }
    case 1: {
      bbb;
      // return
      stack.pop();
      shouldSwitchStack = true;
      break;
    }
  }
}
~~~

## `if` 中递归调用

除了递归调用后的跳转点（case 1），还要考虑到 `if` 相当于带有一个条件不成立时的 `goto if 后` 语句，而 `goto` 语句可以分割出一个跳转点。也就是说，`if` 中递归调用，可以分割出 `递归调用后`、`if 后` 两个跳转点。

~~~cpp
void recursive() {
  // case 0:
  aaa;
  if (bbb /* 不成立时，goto 2 */) {
    recursive();
    // case 1:
    ccc;
    /* goto 2 */
  }

  // case 2:
  ddd;
}

// ===>

while (!shouldSwitchStack) {
  switch (ctx.jumpTo) {
    case 0: {
      aaa;
      if (bbb) {
        // 返回到 1
        ctx.jumpTo = 1;
        // 递归调用
        stack.push(Context());
        shouldSwitchStack = true;
        break;
      }
      ctx.jumpTo = 2;
      break;
    }
    case 1: {
      ccc;
      ctx.jumpTo = 2;
      break;
    }
    case 2: {
      ddd;
      // return
      stack.pop();
      shouldSwitchStack = true;
      break;
    }
  }
}
~~~

## `while` 中递归调用

`while` 可以理解为 `if` + `goto`，比如：

~~~cpp
while (aaa) {
  bbb;
}
~~~

可以理解为 `if` 块末加个 `goto if 开头`。

~~~cpp
start:
if (aaa) {
  bbb;
  goto start;
}
~~~

因此，`while` 中递归调用，可以分割出 `递归调用后`、`while 前`、`while 后` 三个跳转点。

~~~cpp
void recursive() {
  // case 0:
  aaa;
  // case 1:
  while (bbb) {
    recursive();
    // case 2:
    ccc;
    /* goto 1 */
  }

  // case 3:
  ddd;
}

// ===>

while (!shouldSwitchStack) {
  switch (ctx.jumpTo) {
    case 0: {
      aaa;
      ctx.jumpTo = 1;
      break;
    }
    case 1: {
      if (bbb) {
        // 返回到 2
        ctx.jumpTo = 2;
        // 递归调用
        stack.push(Context());
        shouldSwitchStack = true;
        break;
      }
      // while 条件不符合，跳出循环到 3
      ctx.jumpTo = 3;
      break;
    }
    case 2: {
      ccc;
      // 去检查循环条件
      ctx.jumpTo = 1;
      break;
    }
    case 3: {
      ddd;
      // return
      stack.pop();
      shouldSwitchStack = true;
      break;
    }
  }
}
~~~

`continue` 相当于 `goto while 开头`

`break` 相当于 `goto while 后面`

~~~cpp
void recursive() {
  // case 0:
  aaa;
  // case 1:
  while (bbb) {
    if (ccc) {
      /* goto 1 */
      continue;
    }
    if (ddd) {
      /* goto 3 */
      break;
    }
    recursive();
    // case 2:
    eee;
    /* goto 1 */
  }

  // case 3:
  fff;
}
~~~

## `for` 中递归调用


`for` 语句成分比较多，但依旧可以拆解为 `if` + 几个 `goto`，比如：

~~~cpp
for (aaa; bbb; ccc) {
  ddd;
}
~~~

可以理解为 `init` + `if` + `goto 迭代表达式` + `goto if 开头`

~~~cpp
  aaa;
start:
  if (bbb) {
    ddd;
    goto 迭代表达式;
迭代表达式:
    ccc;
    goto start;
  }
~~~

因此，`for` 中递归调用，可以分割出 `递归调用后`、`条件判断前`、`迭代表达式`、`for 后` 四个跳转点。

`continue` 相当于 `goto 迭代表达式`

`break` 相当于 `goto for 后`

~~~cpp
void recursive() {
  // case 0:
  aaa;
  for (
    bbb;
    // case 1:
    ccc;
    // case 3:
    ddd /* goto 1 */
  ) {
    recursive();
    // case 2:
    eee;
    /* goto 3 */
  }

  // case 4:
  fff;
}
~~~

# 例子的非递归实现

根据上面的推导，可以对上述例子进行转化，得到


~~~cpp
void printArrangement(size_t curIndex) {
  for (
    // 这个在初始化函数 ctx 时做
    size_t i = 0;
    // case 0:
    i < length;
    // case 1:
    i += 1 /* goto 0 */
  ) {
    if (isUsed[i]) {
      /* goto 1 */
      continue;
    }
    isUsed[i] = true;
    arr[curIndex] = i;

    if (curIndex + 1 == length) {
      printArr();
      /* goto 2 */
    } else {
      // 递归调用
      printArrangement(curIndex + 1);
      /* goto 2 */
    }

    // case 2:
    isUsed[i] = false;
    /* goto 1 */
  }
  // case 3:
  return;
}
~~~

~~~cpp
struct Context {
  size_t jumpTo = 0;
  size_t i;
  size_t curIndex;
  Context(size_t curIndex):
    curIndex(curIndex),
    i(0) {}
};

void printArrangement(size_t curIndex) {
  std::stack<Context> stack;
  stack.push(Context(curIndex));
  while (!stack.empty()) {
    Context &ctx = stack.top();
    bool shouldSwitchStack = false;
    while (!shouldSwitchStack) {
      switch (ctx.jumpTo) {
        case 0: {
          if (ctx.i < length) {
            if (isUsed[ctx.i]) {
              ctx.jumpTo = 1;
              break;
            }
            isUsed[ctx.i] = true;
            arr[ctx.curIndex] = ctx.i;
            if (ctx.curIndex + 1 == length) {
              printArr();
              ctx.jumpTo = 2;
              break;
            } else {
              ctx.jumpTo = 2;
              // 递归调用
              stack.push(Context(ctx.curIndex + 1));
              shouldSwitchStack = true;
              break;
            }
          } else {
            ctx.jumpTo = 3;
            break;
          }
          break;
        }
        case 1: {
          ctx.i += 1;
          ctx.jumpTo = 0;
          break;
        }
        case 2: {
          isUsed[ctx.i] = false;
          ctx.jumpTo = 1;
          break;
        }
        case 3: {
          // return
          stack.pop();
          shouldSwitchStack = true;
          break;
        }
      }
    }
  }
}
~~~

# 后序遍历

这样看，后续遍历还挺简单的，找好分割点就行了

~~~cpp
void postOrder(Node *node, Visitor visitor) {
  // case 0:
  if (node->left != nullptr) {
    postOrder(node->left, visitor);
    /* goto 1 */
  }
  // case 1:
  if (node->right != nullptr) {
    postOrder(node->right, visitor);
    /* goto 2 */
  }
  // case 2:
  visitor.visit(node);
}
~~~

~~~cpp
struct Context {
  size_t jumpTo = 0;
  Node *node;
  Visitor visitor;
  Context(Node * node, Visitor visitor):
    node(node),
    visitor(visitor) {}
};

void postOrder(Node *node, Visitor visitor) {
  std::stack<Context> stack;
  stack.push(Context(node));
  while (!stack.empty()) {
    Context &ctx = stack.top();

    bool shouldSwitchStack = false;
    while (!shouldSwitchStack) {
      switch (ctx.jumpTo) {
        case 0: {
          if (ctx.node->left !== nullptr) {
            ctx.jumpTo = 1;
            // 递归调用
            stack.push(Context(ctx.node->left, ctx.visitor));
            shouldSwitchStack = true;
            break;
          }
          ctx.jumpTo = 1;
          break;
        }
        case 1: {
          if (ctx.node->right !== nullptr) {
            ctx.jumpTo = 2;
            // 递归调用
            stack.push(Context(ctx.node->right, ctx.visitor));
            shouldSwitchStack = true;
            break;
          }
          ctx.jumpTo = 2;
          break;
        }
        case 2: {
          visitor.visit(ctx.node);
          // return
          stack.pop();
          shouldSwitchStack = true;
          break;
        }
      }
    }
  }
}
~~~
