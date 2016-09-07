---
layout: post
title: "常用输出格式归纳：printf 和 stream"
subtitle: "output format comparison between c-style printf and cpp-style stream"
create-date: 2016-03-13
update-date: 2016-09-04
header-img: ""
author: "Mensu"
tags:
    - 归纳
    - C / C++
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


说起输出格式的控制，C 中用得最多的是各种 printf ，例如 ``printf``、``fprintf``、``sprintf`` ，声明于 ``<stdio.h>`` ，调用时必须通过字符串设置格式

而 C++ 中一般使用各种 stream ，例如 ``ostream``、``ofstream``、``ostringstream`` ，声明于 ``<iostream>``、``<fstream>``、``<sstream>`` 等，使用 stream 单纯地进行默认输出时十分简洁，而控制格式时则要通过自身的成员函数或者 ``<iomanip>`` 中的流控制符（stream manipulators），显得略微繁琐

下面按照需求进行归纳

# 整数 n 进制

printf

~~~cpp
// C code
int num = 10;

printf("十六进制小写：%x"
     "\n十六进制大写：%X"
     "\n八进制：%o"
     "\n十进制：%d"
     "\n", num, num, num, num);
~~~

![set bases in printf](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-bases-printf.png)

----

stream

~~~cpp
// C++ code
int num = 10;

std::cout << "十六进制：" << std::hex << num << std::endl
          << "八进制：" << std::oct << num << std::endl
          << "十进制：" << std::dec << num << std::endl;
~~~

![set bases in stream using specific manipulators](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-bases-stream-specific-iomanipulator.png)

或者用流控制符 ``std::setbase(int __base)`` 设置 n 进制。注意，如果传入的不是 8、10、16，则输出**十进制**

~~~cpp
// C++ code
int num = 10;

std::cout << "十六进制：" << std::setbase(16) << num << std::endl
          << "八进制：" << std::setbase(8) << num << std::endl
          << "十进制：" << std::setbase(10) << num << std::endl;
~~~

![set bases in stream using std::setbase](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-bases-stream-setbase.png)

# setiosflags 和 cout.setf

控制 stream 的输出格式，除了使用有具体含义的流控制符，还可以使用以下的

- 立 flag 流控制符 ``std::setiosflags(std::ios_base::fmtflags __mask)``
- stream 的成员函数如 ``std::cout.setf(std::ios_base::fmtflags __fmtfl)``

这两者效果相同，通过传入形如 ``std::ios::xxx`` 的参数（ios 参数）设置相应的输出格式。需要传入多个参数时，用按位或运算符 ``|`` 连接

相反，取消设置使用

- ``std::resetiosflags(std::ios_base::fmtflags __mask)``
- ``std::cout.unsetf(std::ios_base::fmtflags __fmtfl)`` 

例如，ios 参数 ``std::ios::uppercase`` 使十六进制的字母部分大写，我们可以：

~~~cpp
// C++ code
int num = 10;

// 具体含义的流控制符 std::uppercase
std::cout << "使用流控制符 std::uppercase\n  "
          << "十六进制大写：" << std::hex
                            << std::uppercase << num << std::endl
          << "  取消：" << std::resetiosflags(std::ios::uppercase) << num << std::endl << std::endl;

// 立 flag 流控制符 std::setiosflags
std::cout << "使用立flag流控制符 std::setiosflags\n  "
          << "十六进制大写：" << std::hex
                           << std::setiosflags(std::ios::uppercase) << num << std::endl
          << "  取消：" << std::resetiosflags(std::ios::uppercase) << num << std::endl << std::endl;

// 成员函数 std::cout.setf
std::cout << "使用成员函数 std::cout.setf\n  ";
std::cout.setf(std::ios::uppercase);
std::cout << "十六进制大写：" << std::hex
                            << num << std::endl;
std::cout.unsetf(std::ios::uppercase);
std::cout << "  取消：" << num << std::endl;
~~~

![std::uppercase](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-uppercase-stream.png)

## 对应关系

大部分不带参数的流控制符 ``XXX`` ，都对应着 ios 参数 ``std::ios::XXX`` 。也就是说

~~~cpp
// C++ code
// 具体的流控制符
std::cout << std::XXX;
// 立 flag 流控制符
std::cout << std::setiosflags(std::ios::XXX);
// 成员函数
std::cout.setf(std::ios::XXX);
~~~

一般这三种方式的效果相同。而在设置三大格式：进制、对齐方式、小数表示法的时候，具体的流控制符与其他两种方式的效果不同

具体来说，具体的流控制符 ``std::XXX`` 或 ``std::setXX`` 会先将对应格式**恢复成默认状态**，再进行新的设置，而其他两种方式只是在单纯地往之前的结果上“叠加”新的效果。而“叠加”的结果十分复杂，不一定如我们所愿

所以，以设置八进制为例，要么直接用流控制符 ``std::oct``、``std::setbase(int __base)``

~~~cpp
// C++ code
int num = 10;

std::cout << std::oct << num << std::endl;
// 或者 std::cout << std::setbase(8) << num << std::endl;
~~~

要么，就要**先取消目前的进制设置**（默认是十进制），在设置新的进制

~~~cpp
// C++ code
int num = 10;

std::cout.unsetf(std::ios::dec);
std::cout << std::setiosflags(std::ios::oct) << num << std::endl;
~~~

要么，就用**带两个参数**的成员函数 ``std::cout.setf(...)``

~~~cpp
// C++ code
int num = 10;

std::cout.setf(std::ios::oct, std::ios::basefield);
std::cout << num << std::endl;
~~~

由此可见，具体的流控制符 ``std::oct``、``std::setbase(int __base)`` 自带清除先前设置的效果，十分方便

## 取消设置

最好养成用完格式设置后立刻恢复的习惯。可以使用上面提到的 ``std::resetiosflags(...)``、``std::cout.unsetf(...)`` 

~~~cpp
// C++ code
int num = 10;

std::cout << std::oct << num << std::endl
          << std::resetiosflags(std::ios::oct);
~~~

---

对于不带参数的流控制符，还可以用成员函数 ``std::cout.flags`` 恢复

~~~cpp
// C++ code

int num = 10;

// 设置前备份
std::ios_base::fmtflags defaultFlags = std::cout.flags();

// 用流控制符处理格式
std::cout << std::oct << num << std::endl;

// 还原
std::cout.flags(defaultFlags);
~~~

---

对于三大格式，还可以用下面三个 ios 参数，而不必关心他们目前具体是哪种格式

- ``std::ios::basefield`` 进制
- ``std::ios::adjustfield`` 对齐方式
- ``std::ios::floatfield`` 小数表示法


~~~cpp
// C++ code
std::cout << std::resetiosflags(std::ios::basefield);  // 恢复回十进制
~~~

而除了这三大格式，其他不带参数的流控制符 ``std::XXX`` ，一般都有起相反作用的流控制符 ``std::noXXX`` 与其对应

~~~cpp
// C++ code
std::cout << std::nouppercase;  // 取消字母大写
~~~

# 宽度 对齐 填补

printf 的限制很大，例如 “填补字符” 只有 '0' 和 空格 ' '，使用 '0' 时还只能使用右对齐。因为左对齐的 ``-`` 会排斥填补的 ``0``

~~~cpp
// C code
double num = 4.0;
printf("最小宽度为11，右对齐：%11.g%11g"
    "\n最小宽度为11，左对齐：%-11g%-11.g"
    "\n\n最小宽度为11，右对齐，左边空白补0：%011.g%11g"
    "\n\n", num, num, num, num, num, num);

// 应用：输出时间格式 12:08:03
int hour = 12, minute = 8, second = 3;
printf("最小宽度为2，右对齐，如果宽度不足2，则在左边补0："
        "%02d:%02d:%02d"
        "\n\n", hour, minute, second);
~~~

![width, adjustment and fill in printf](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-width-adjustment-fill-printf.png)

-----

相比之下，stream 的填补更加灵活，可以自定义填补字符，而且 “左右对齐” 和 “填补字符” 可以自由组合

**注意**，stream 在设置最小宽度时使用的  

- 流控制符 ``std::setw(int __n)``
- 成员函数 ``std::cout.width(std::streamsize __wide)``

**仅对下一个输出有效**，因此需要不断使用

~~~cpp
// C++ code
double num = 4.0;

// 注意，对于浮点数，stream 们的默认输出相当于 printf 的 %g
std::cout << "最小宽度为11，右对齐：" << std::setw(11) << num << std::flush
                                  << std::setw(11) << num << std::endl
          << "最小宽度为11，左对齐：" << std::left
                                  << std::setw(11) << num << std::flush
                                  << std::setw(11) << num << std::endl << std::endl
                                  << std::resetiosflags(std::ios::left)
    
          << "最小宽度为11，右对齐，左边空白补0：" << std::right
                                              << std::setfill('0') << std::setw(11) << num << std::flush
                                              << std::setfill(' ') << std::setw(11) << num << std::endl
                                              << std::resetiosflags(std::ios::right)
                                        
          << "最小宽度为11，左对齐，右边空白补*：" << std::left
                                              << std::setfill('*') << std::setw(11) << num << std::flush
                                              << std::setfill(' ') << std::setw(11) << num << std::endl << std::endl
                                              << std::resetiosflags(std::ios::left);

// 应用：输出时间格式 12:08:03
int hour = 12, minute = 8, second = 3;
std::cout << "最小宽度为2，右对齐，如果宽度不足2，则在左边补0："
          << std::setfill('0')
          << std::setw(2) << hour << ':' << std::flush
          << std::setw(2) << minute << ':' << std::flush
          << std::setw(2) << second << std::endl << std::endl;
std::cout.fill(' ');
~~~

![width, adjustment and fill in stream](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-width-adjustment-fill-stream.png)

# 符号

printf 用 ``+`` 为十进制正数输出正号  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 空格 将十进制数的正号换成空格  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 ``#`` 为八进制和十六进制数输出 ``0`` 和 ``0x``

- 一类：进制号 ``#`` \| 十进制正号 ``+`` > 十进制空格
- 二类：左对齐 ``-`` > 补零 ``0``

一类和二类自由组合

~~~cpp
// C code
// 应用：避免输出 “+-6”
int a = 2, b = 3, c = -6;
printf("平面上某直线的一般方程：%dx%+dy%+d=0"     // 6个部分：%d x %+d y %+d = 0  （ 正号+
    "\n\n正号 补0 最小宽度：%+07d%0+7d"          // 2个部分：%+07d %0+7d         （ 正号+ 与 填补0 自由组合，7设置最小宽度
    "\n\n左对齐 进制号 最小宽度：%#-7x%-#7x%d"    // 3个部分：%#-7x %-#7x %d      （ 左对齐- 与 进制号# 自由组合，7设置最小宽度
    "\n\n", a, b ,c, 1, 2, 3, 4, 5);
~~~

![show positive or base sign in printf](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-show-positive-or-base-sign-printf.png)

----

stream 用 流控制符 ``std::showpos`` 为十进制正数输出正号  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 流控制符 ``std::showbase`` 为八进制和十六进制数输出 ``0`` 和 ``0x``

~~~cpp
// C++ code
// 应用：避免输出 “+-6”
int a = 2, b = 3, c = -6;
std::cout << "平面上某直线的一般方程："
          << a << 'x' << std::flush
          << std::showpos
          << b << 'y' << std::flush
          << c << "=0" << std::endl << std::endl
          << std::resetiosflags(std::ios::showpos);
~~~

![show positive or base sign in stream](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-show-positive-or-base-sign-stream.png)

# 小数

printf

~~~cpp
// C code
double small = 0.003406000400001;
double big = 42.213;

// 7位有效数字，去掉多余的0，输出普通计数法和科学计数法中较短的：使用g
// 大写G决定指数符号大写
printf("7位有效数字，去掉多余的0：\n  "
        "small = %.7g, big = %.7g"
        "\n", small, big);

// 7位有效数字，显示多余的0和小数点：使用#
printf("7位有效数字，显示多余的0：\n  "
        "small = %#.7g, big = %#.7g"
        "\n", small, big);

// 普通计数法：使用f
printf("\n普通计数法，小数点后7位（包括多余的0）：\n  "
        "small = %.7f, big = %.7f"
        "\n", small, big);

// 科学计数法：使用e
// 大写E决定指数符号大写
printf("\n科学计数法，小数点后7位（包括多余的0）：\n  "
        "small = %.7e, big = %.7E"
        "\n", small, big);

// 动态控制最小宽度、精度：使用*作占位符
int leastWidth = 10, precision = 7;
printf("\n动态控制最小宽度、精度：%+-*.*f"   // 正号+、左对齐-、动态最小宽度*、精度*、普通计数法f
        "\n\n", leastWidth, precision, small);
~~~

![set precision in printf](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-precision-printf.png)

----

stream

~~~cpp
// C++ code
double small = 0.003406000400001;
double big = 42.213;
std::ios_base::fmtflags defaultFlags = std::cout.flags();

// 7位有效数字，去掉多余的0（默认），输出普通计数法和科学计数法中较短的
std::cout << "7位有效数字，去掉多余的0：\n  "
          << std::setprecision(7)
          << "small = " << small << std::flush
          << ", big = " << big << std::endl << std::endl
          << std::setprecision(6);

// 7位有效数字，显示多余的0和小数点：std::defaultfloat，C++11 开始可用
std::cout << "7位有效数字，显示多余的0：\n  "
          << std::setprecision(7) << std::showpoint
          << "small = " << small << std::flush
          << ", big = " << big << std::endl << std::endl
          << std::setprecision(6) << std::noshowpoint;

// 普通计数法：使用 std::fixed
std::cout << "普通计数法，小数点后7位（包括多余的0）：\n  "
          << std::fixed << std::setprecision(7)
          << "small = " << small << std::flush
          << ", big = " << big << std::endl << std::endl
          << std::setprecision(6) << std::resetiosflags(std::ios::fixed);

// 科学计数法：使用 std::scientific
std::cout << "科学计数法，小数点后7位（包括多余的0）：\n  "
          << std::scientific << std::setprecision(7)
          << "small = " << small << std::flush
          << std::uppercase
          << ", big = " << big << std::endl << std::endl
          << std::resetiosflags(std::ios::scientific|std::ios::uppercase) << std::setprecision(6);
    
// 动态控制最小宽度、精度
int leastWidth = 10, precision = 7;
std::cout << "动态控制最小宽度、精度："
          << std::showpos << std::left << std::fixed
          << std::setprecision(precision) << std::setw(leastWidth)
          << small << std::endl << std::endl;
std::cout.flags(defaultFlags), std::cout.precision(6);
~~~

![set precision in stream](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-precision-stream.png)

# 其他格式

## std::internal

和 ``std::left``、``std::right`` 一样，是 ``std::adjustfield`` 系列。在设置了宽度的前提下，将符号（十进制正负号、进制符号`0`、`0x`）左对齐，将数字右对齐

~~~cpp
// C++ code
int num = 12;
std::ios_base::fmtflags defaultFlags = std::cout.flags();
std::cout << std::internal
          << std::setw(12) << -num << std::endl
          << std::hex << std::showbase
          << std::setw(12) << num << std::endl;
std::cout.flags(defaultFlags);
~~~

![std::internal](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-internal-stream.png)

--------

## std::boolalpha

这个可以让布尔类型以 ``true``、``false`` 的形式显示

~~~cpp
// C++ code
std::cout << true << ' ' << false << std::endl
          << std::boolalpha
          << true << ' ' << false << std::endl
          << std::noboolalpha;
~~~

![std::boolalpha](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-boolalpha-stream.png)