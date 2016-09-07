---
layout: post
title: "在 Ubuntu 上使用 Google Test"
subtitle: "using Google Test on Ubuntu"
create-date: 2016-08-19
update-date: 2016-09-04
header-img: ""
author: "Mensu"
tags:
    - 搭建开发环境
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

# 问题

今天在云日卓的云桌面（Ubuntu系统）上开始实训，接触到了 Google Test 这种测试框架。然而看了教程，对于如何搭建测试环境，即如何把充满 ``TEST`` 、 ``EXPECT_EQ`` 的测试文件 ``test.cpp`` 编译并投入使用，我还是一脸懵逼。教程们主要针对怎么写 ``test.cpp`` ，这显然高估了我的测试环境搭建能力。好在经过一阵摸索，我也找到了编译的办法

# 解压

先从[官方](https://github.com/google/googletest/releases){:target="_blank"}那下载 **gtest-1.6.0**

然后解压

![extract](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-extract.png)

![after-extract](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-after-extract.png)

把生成的文件夹 ``Ctrl+C`` 、``Ctrl+V`` 复制粘贴到找得到的地方。这里我复制到了 ``test`` 目录下

![copy](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-copy.png)

# 生成可被链接的文件

打开复制得到的 ``gtest-1.6.0`` ，找到 ``make`` 文件夹。通过终端进入这个 ``make`` 文件夹

方法是同时按下 ``Ctrl+Alt+T`` 打开终端，输入 ``cd`` 加空格，然后把 ``make`` 文件夹左键拖动到终端并放开，回车

![drag to terminal](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-cd-drag.png)

![result](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-cd-result.png)

然后敲入 ``make`` ，等待它编译好

![make](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-make.png)

结果编译错误...

![compile error](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-error.png)

嘛不要紧，亲自到 ``make`` 目录看看  
只要有 ``gtest_main.o`` 、 ``gtest_all.o`` 、 ``gtest_main.a`` 这三个文件在，就可以继续了

把 ``gtest_main.a`` 重命名为 ``libgtest.a`` ，准备完毕

![rename1](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-rename1.png)

![rename2](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-rename2.png)

# 编译测试文件

在这里我准备好了 ``Date.hpp`` 和 ``Date.cpp`` 供测试

![file display](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-test1.png)

以及一份简单的 ``test.cpp``

![test.cpp](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-test2.png)

相关的目录结构为

~~~css
  test
    ├── date
    │   ├── Date.hpp
    │   ├── Date.cpp
    │   └── test.cpp
    │
    └── gtest-1.6.0
        ├── include
        └── make
            ├── gtest_main.o
            ├── gtest_all.o
            └── libgtest.a
~~~

在这种目录结构下，编译命令为

~~~trueBash
g++ Date.cpp test.cpp -I ../gtest-1.6.0/include -L ../gtest-1.6.0/make -lgtest -lpthread -o test
~~~

- ``g++ Date.cpp test.cpp`` 把这两份文件编译为可执行文件
- ``../`` 指的是 ``date`` 的上级目录 ``test`` ，例如 ``../gtest-1.6.0/include`` 就是 ``/test/gtest-1.6.0/include`` 的意思
- ``-I ../gtest-1.6.0/include`` 提供 ``#include`` 的备选目录。在 ``test.cpp`` 中有 ``#include "gtest/gtest.h"`` 一句，其中 ``gtest/gtest.h`` 就在 ``../gtest-1.6.0/include`` 下。没有该参数，编译器就不会去 ``/test/gtest-1.6.0/include`` 下头文件，结果找不到 ``gtest.h`` 而报错
- ``-L ../gtest-1.6.0/make`` 提供链接库.a文件的备选目录。有了这个参数，处理 ``-lgtest`` 时才找的到对应的链接库 ``libgtest.a``
- ``-lpthread`` 和线程有关的库。Google Test 运行中有用到相关函数，所以要链接上
- ``-o test`` 设置输出文件的名字为 ``test``

![compile](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-test3.png)

大功告成！运行下试试

~~~trueBash
./test
~~~

![run](http://7xrahq.com1.z0.glb.clouddn.com/using-google-test-on-ubuntu-test4.png)

本质上，就是在编译过程中要链接好 ``libgtest.a`` 这个库（和线程那个库）。这个库实际上是由 ``gtest_all.o`` 和 ``gtest_main.o`` 组成。因此我们也可以不要链接 ``libgtest.a``，而是按熟悉的 ``g++ 输入文件 -o 输出文件名`` 的方式

~~~trueBash
g++ Date.cpp test.cpp ../gtest-1.6.0/make/gtest_all.o ../gtest-1.6.0/make/gtest_main.o -I ../gtest-1.6.0/include -lpthread -o test
~~~

上面这段只是把输入文件变成了 ``Date.cpp`` 、 ``test.cpp`` 、 ``../gtest-1.6.0/make/gtest_all.o`` 和 ``../gtest-1.6.0/make/gtest_main.o``

即编译 ``Date.cpp`` 和 ``test.cpp`` ，链接 ``../gtest-1.6.0/make/gtest_all.o`` 和 ``../gtest-1.6.0/make/gtest_main.o``，其他不变，效果拔群
