---
layout: post
title: "常用输出格式归纳：printf 和 stream"
subtitle: "output format comparison between c-style printf and cpp-style stream"
create-date: 2016-03-13
update-date: 2016-03-27
header-img: ""
author: "Mensu"
tags:
    - 归纳
    - C / C++
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%-d" }}**.

# 目录
1. [整数 n 进制](#n-)
2. [setiosflags 和 cout.setf](#setiosflags--coutsetf)
3. [最小宽度、左右对齐、填补、符号](#section-1)
4. [小数](#section-2)
5. [其他格式](#section-3)

说起输出格式的控制，C 中用得最多的是各种 printf ，例如 `printf`、`fprintf`、`sprintf` ，声明于 `<stdio.h>` ，调用时必须通过字符串设置格式

而 C++ 中一般使用各种 stream ，例如 `ostream`、`ofstream`、`ostringstream` ，声明于 `<iostream>`、`<fstream>`、`<sstream>` 等，使用 stream 单纯地进行默认输出时十分简洁，而控制格式时则要通过自身的成员函数或者 `<iomanip>` 中的流控制符（stream manipulator），显得略微繁琐

下面按照需求进行归纳

### 整数 n 进制

printf

~~~c
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
using std::cout;
using std::endl;
using std::dec;
using std::oct;
using std::hex;
int num = 10;

cout << "十六进制：" << hex << num << endl
    << "八进制：" << oct << num << endl
    << "十进制：" << dec << num << endl;
~~~

![set bases in stream using specific manipulators](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-bases-stream-specific-iomanipulator.png)

或者用流控制符 `std::setbase(int __base)` 设置 n 进制。注意，如果传入的不是 8、10、16，则输出**十进制**

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::setbase;
int num = 10;

cout << "十六进制：" << setbase(16) << num << endl
    << "八进制：" << setbase(8) << num << endl
    << "十进制：" << setbase(10) << num << endl;
~~~

![set bases in stream using setbase()](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-bases-stream-setbase.png)

### setiosflags 和 cout.setf

控制 stream 的输出格式，除了使用有具体含义的流控制符，还可以使用以下的

- 立 flag 流控制符 `std::setiosflags(ios_base::fmtflags __mask)`
- stream 的成员函数如 `std::cout.setf(ios_base::fmtflags __fmtfl)`

它们虽然语法不同，但效果相同，通过传入形如 `ios::xxx` 的参数（ios 参数）设置相应的输出格式。需要传入多个参数时，用按位或运算符 `|` 连接。取消设置使用

- `std::resetiosflags(ios_base::fmtflags __mask)`
- `std::cout.unsetf(ios_base::fmtflags __fmtfl)` 

例如，ios 参数 `ios::uppercase` 使十六进制的字母部分大写，我们可以：

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::hex;
using std::uppercase;
using std::resetiosflags;
using std::ios;
using std::setiosflags;

int num = 10;

// 流控制符 std::uppercase
cout << "使用流控制符 std::uppercase\n  "
    << "十六进制大写：" << hex
                    << uppercase << num << endl
    << "  取消：" << resetiosflags(ios::uppercase) << num << endl << endl;

// 立flag流控制符 std::setiosflags
cout << "使用立flag流控制符 std::setiosflags\n  "
    << "十六进制大写：" << hex
                    << setiosflags(ios::uppercase) << num << endl
    << "  取消：" << resetiosflags(ios::uppercase) << num << endl << endl;

// 成员函数 std::cout.setf
cout << "使用成员函数 std::cout.setf\n  ";
cout.setf(ios::uppercase);
cout << "十六进制大写：" << hex
                        << num << endl;
cout.unsetf(ios::uppercase);
cout << "  取消：" << num << endl;
~~~

![uppercase](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-uppercase-stream.png)

---

大部分不带参数的流控制符 `XXX`，都对应着 ios 参数 `ios::XXX`。也就是说

~~~cpp
// C++ code
using std::cout;

cout << std::XXX;
cout << std::setiosflags(ios::XXX);
cout.setf(ios::XXX);
~~~

这三句的主要效果相同。而在设置整数 n 进制的时候，以八进制为例，要么直接用流控制符

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::oct;
int num = 10;

cout << oct << num << endl;
~~~

要么，用其他两个，就要先取消目前的进制设置（默认是十进制）

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::ios;
using std::setiosflags;
int num = 10;

cout.unsetf(ios::dec);
cout << setiosflags(ios::oct) << num << endl;
~~~

要么，就用带两个参数的成员函数 `std::cout.setf`

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::ios;
int num = 10;

cout.setf(ios::oct, ios::basefield);
cout << num << endl;
~~~

由此可见，具体的流控制符 `std::oct` 自带清除先前设置的效果，十分方便

---

最好养成用完格式设置后立刻恢复的习惯

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::oct;
using std::resetiosflags;
using std::ios;
int num = 10;

cout << oct << num << endl
    << resetiosflags(ios::oct);
~~~

对于不带参数的流控制符，还可以用成员函数 `std::cout.flags` 恢复

~~~cpp
// C++ code

int num = 10;

// 设置前备份
std::ios_base::fmtflags defaultFlags = std::cout.flags();

/* --- 用流控制符处理格式 --- */
std::cout << std::oct << num << std::endl;

// 还原
std::cout.flags(defaultFlags);
~~~

---

取消设置时，可以用下面三个 ios 参数将对应的三类格式恢复为默认状态

- `ios::basefield` 进制
- `ios::adjustfield` 对齐方式
- `ios::floatfield` 小数表示法


~~~cpp
// C++ code
std::cout << std::resetiosflags(std::ios::basefield);  // 恢复回十进制
~~~

而除了这三类格式，其他不带参数的流控制符 `std::XXX`，一般都有起相反作用的流控制符 `std::noXXX` 与其对应

~~~cpp
// C++ code
std::cout << std::nouppercase;  // 取消字母大写
~~~

### 最小宽度、左右对齐、填补、符号

printf 的填补只能在右对齐的情况下用 '0' 补左边的空白。因为左对齐的 `-` 会排斥 补零的 `0`

~~~c
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

- 流控制符 `std::setw(int __n)`
- 成员函数 `std::cout.width(std::streamsize __wide)`

**仅对下一个输出有效**，因此需要不断使用

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::flush;
using std::setw;
using std::right;
using std::left;
using std::setfill;
using std::resetiosflags;
using std::ios;
double num = 4.0;

// 注意，对于浮点数，stream 们的默认输出相当于 printf 的 %g
cout << "最小宽度为11，右对齐：" << setw(11) << num << flush
                            << setw(11) << num << endl
    << "最小宽度为11，左对齐：" << left
                            << setw(11) << num << flush
                            << setw(11) << num << endl << endl
                            << resetiosflags(ios::left)
    
    << "最小宽度为11，右对齐，左边空白补0：" << right
                                        << setfill('0') << setw(11) << num << flush
                                        << setfill(' ') << setw(11) << num << endl
                                        << resetiosflags(ios::right)
                                        
    << "最小宽度为11，左对齐，右边空白补*：" << left
                                        << setfill('*') << setw(11) << num << flush
                                        << setfill(' ') << setw(11) << num << endl << endl
                                        << resetiosflags(ios::left);

// 应用：输出时间格式 12:08:03
int hour = 12, minute = 8, second = 3;
cout << "最小宽度为2，右对齐，如果宽度不足2，则在左边补0："
    << setfill('0')
    << setw(2) << hour << ':' << flush
    << setw(2) << minute << ':' << flush
    << setw(2) << second << endl << endl;
cout.fill(' ');
~~~

![width, adjustment and fill in stream](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-width-adjustment-fill-stream.png)

---

printf 用 `+` 为十进制正数输出正号  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 空格 将十进制数的正号换成空格  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 `#` 为八进制和十六进制数输出 `0` 和 `0x`

- 一类：进制号 `#` \| 十进制正号 `+` > 十进制空格
- 二类：左对齐 `-` > 补零 `0`

一类和二类自由组合

~~~c
// C code
// 应用：避免输出 “+-6”
int a = 2, b = 3, c = -6;
printf("平面上某直线的一般方程：%dx%+dy%+d=0"
    "\n\n正号 补0 最小宽度：%+07d%0+7d"
    "\n\n左对齐 进制号 最小宽度：%#-7x%-#7x%d"
    "\n\n", a, b ,c, 1, 2, 3, 4, 5);
~~~

![show positive or base sign in printf](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-show-positive-or-base-sign-printf.png)

----

stream 用 流控制符 `showpos` 为十进制正数输出正号  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 流控制符 `showbase` 为八进制和十六进制数输出 `0` 和 `0x`

~~~cpp
// C++ code
// 应用：避免输出 “+-6”
using std::cout;
using std::endl;
using std::flush;
using std::showpos;
using std::resetiosflags;
using std::ios;
int a = 2, b = 3, c = -6;
cout << "平面上某直线的一般方程："
    << a << 'x' << flush
    << showpos
    << b << 'y' << flush
    << c << "=0" << endl << endl
    << resetiosflags(ios::showpos);
~~~

![show positive or base sign in stream](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-show-positive-or-base-sign-stream.png)

### 小数

printf 中，想指定有效数字来显示小数，就必须去掉多余的0

~~~c
// C code
double small = 0.003406000400001;
double big = 42.213;

// 7位有效数字，去掉多余的0，输出普通计数法和科学计数法中较短的，大写G决定指数符号大写
printf("7位有效数字，去掉多余的0：\n  "
        "small = %.7g, big = %.7g"
        "\n", small, big);

// 普通计数法
printf("\n普通计数法，小数点后7位（包括多余的0）：\n  "
        "small = %.7f, big = %.7f"
        "\n", small, big);

// 科学计数法，大写E决定指数符号大写
printf("\n科学计数法，小数点后7位（包括多余的0）：\n  "
        "small = %.7e, big = %.7E"
        "\n", small, big);

// 动态控制最小宽度、精度
int leastWide = 10, precision = 7;
printf("\n动态控制最小宽度、精度：%+-*.*f"
        "\n\n", leastWide, precision, small);
~~~

![set precision in printf](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-precision-printf.png)

----

stream 则较为灵活

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::flush;
using std::setprecision;
using std::showpoint;
using std::noshowpoint;
using std::fixed;
using std::resetiosflags;
using std::ios;
using std::scientific;
using std::uppercase;
using std::left;
using std::setw;
using std::showpos;

double small = 0.003406000400001;
double big = 42.213;
std::ios_base::fmtflags defaultFlags = cout.flags();

// 有效数字，去掉多余的0（默认），输出普通计数法和科学计数法中较短的
cout << "7位有效数字，去掉多余的0：\n  "
    << setprecision(7)
    << "small = " << small << flush
    << ", big = " << big << endl << endl
    << setprecision(6);

// 有效数字，显示多余的0和小数点
cout << "7位有效数字，显示多余的0：\n  "
    << setprecision(7) << showpoint
    << "small = " << small << flush
    << ", big = " << big << endl << endl
    << setprecision(6) << noshowpoint;

// 普通计数法
cout << "普通计数法，小数点后7位（包括多余的0）：\n  "
    << fixed << setprecision(7)
    << "small = " << small << flush
    << ", big = " << big << endl << endl
    << setprecision(6) << resetiosflags(ios::fixed);

// 科学计数法
cout << "科学计数法，小数点后7位（包括多余的0）：\n  "
    << scientific << setprecision(7)
    << "small = " << small << flush
    << uppercase
    << ", big = " << big << endl << endl
    << resetiosflags(ios::scientific|ios::uppercase) << setprecision(6);
    
// 动态控制最小宽度、精度
int leastWide = 10, precision = 7;
cout << "动态控制最小宽度、精度："
    << showpos << left << fixed
    << setprecision(precision) << setw(leastWide)
    << small << endl << endl;
cout.flags(defaultFlags), cout.precision(6);
~~~

![set precision in stream](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-set-precision-stream.png)

### 其他格式

`std::internal`

和 `std::left`、`std::right` 一样，是 `std::adjustfield` 系列。在设置了宽度的前提下，将符号（十进制正负号、进制符号`0`、`0x`）左对齐，将数字右对齐

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::internal;
using std::setw;
using std::showbase;
using std::hex;
int num = 12;
std::ios_base::fmtflags defaultFlags = cout.flags();
cout << internal
    << setw(12) << -num << endl
    << hex << showbase
    << setw(12) << num << endl;
cout.flags(defaultFlags);
~~~

![std::internal](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-internal-stream.png)

--------

`std::boolalpha`

这个可以让布尔类型以 `true`、`false` 的形式显示

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::boolalpha;
using std::noboolalpha;
cout << true << ' ' << false << endl
    << boolalpha
    << true << ' ' << false << endl
    << noboolalpha;
~~~

![std::boolalpha](http://7xrahq.com1.z0.glb.clouddn.com/printf-and-stream-boolalpha-stream.png)