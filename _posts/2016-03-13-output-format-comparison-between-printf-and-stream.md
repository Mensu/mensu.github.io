---
layout: post
title: "常用输出格式归纳：printf 和 stream"
subtitle: "output format comparison between c-style printf and cpp-style stream"
create-date: 2016-03-13
update-date: 2016-03-15
header-img: ""
author: "Mensu"
tags:
    - 归纳
    - C / C++
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%-d" }}**.

说起输出格式的控制，C 中用得最多的是各种 printf ，例如 `printf`、`fprintf`、`sprintf` ，声明于 `<stdio.h>` ，调用时必须通过字符串设置格式  
而 C++ 中一般使用各种 stream ，例如 `ostream`、`ofstream`、`ostringstream` ，声明于 `<iostream>`、`<fstream>`、`<sstream>` 等，使用 stream 单纯地进行默认输出时十分简洁，而控制格式时则要通过自身的成员函数或者 `<iomanip>` 中的流控制符（stream manipulator），显得略微繁琐

下面按照需求进行归纳

## 整数 n 进制

printf：

~~~c
// C code
int num = 10;

printf("十六进制小写：%x"
    "\n十六进制大写：%X"
    "\n八进制：%o"
    "\n十进制：%d"
    "\n", num, num, num, num);
~~~

stream：

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::dec;
using std::oct;
using std::hex;
int num = 10;

cout << "十六进制：" << hex << num << '\n'
    << "八进制：" << oct << num << '\n'
    << "十进制：" << dec << num << endl;
~~~

或者用流控制符 `std::setbase(int __base)` 设置 n 进制。注意，如果传入的不是 8、10、16，则输出**十进制**

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::setbase;
int num = 10;

cout << "十六进制：" << setbase(16) << num << '\n'
    << "八进制：" << setbase(8) << num << '\n'
    << "十进制：" << setbase(10) << num << endl;
~~~

## setiosflags 和 cout.setf

控制 stream 的输出格式，除了传入有具体含义的流控制符，还可以使用以下的

- 立 flag 流控制符 `std::setiosflags(ios_base::fmtflags __mask)`
- stream 的成员函数如 `std::cout.setf(ios_base::fmtflags __fmtfl)`

它们虽然语法不同，但效果相同，通过传入形如 `ios::xxx` 的参数（ios 参数）设置相应的输出格式。需要传入多个参数时，用按位或运算符 `|` 连接。取消设置使用

- `std::resetiosflags(ios_base::fmtflags __mask)`
- `std::cout.unsetf(ios_base::fmtflags __fmtfl)` 

例如，流控制符 `std::uppercase` 使十六进制的字母部分大写，我们可以用：

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
                    << uppercase << num << '\n'
    << "  取消：" << resetiosflags(ios::uppercase) << num << endl << endl;

// 立flag流控制符 std::setiosflags
cout << "使用立flag流控制符 std::setiosflags\n  "
    << "十六进制大写：" << hex
                    << setiosflags(ios::uppercase) << num << '\n'
    << "  取消：" << resetiosflags(ios::uppercase) << num << endl << endl;

// 成员函数
cout << "使用成员函数 std::cout.setf" << '\n';
cout.setf(ios::uppercase);
cout << "十六进制大写：" << hex
                        << num << '\n';
cout.unsetf(ios::uppercase);
cout << "  取消：" << num << endl;
~~~

大部分不带参数的流控制符 `XXX`，都对应有 ios 参数 `ios::XXX`。也就是说

~~~cpp
// C++ code
using std::cout;

cout << std::XXX;
cout << std::setiosflags(ios::XXX);
cout.setf(ios::XXX);
~~~

主要效果相同。而在设置整数 n 进制的时候，以八进制为例，可以直接

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::oct;
int num = 10;

cout << oct << num << endl;
~~~

否则，要先取消目前的进制设置。默认是十进制

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

或者用两个参数的成员函数 `std::cout.setf`

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::ios;
int num = 10;

cout.setf(ios::oct, ios::basefield);
cout << num << endl;
~~~

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
// 设置前备份
std::ios_base::fmtflags defaultFlags = cout.flags();

/* --- 用流控制符处理格式 --- */
cout << oct << num << endl;

// 还原
cout.flags(defaultFlags);
~~~

## 最小宽度、左右对齐、填补、符号

printf 的填补只能在右对齐的情况下用 '0' 补左边的空白。因为左对齐的 `-` 会排斥 补零的 `0`

~~~c
// C code
double num = 4.0;
printf("最小宽度为11，右对齐：%11.g%11g"
    "\n最小宽度为11，左对齐：%-11g%-11.g"
    "\n最小宽度为11，右对齐，左边空白补0：%011.g%11g"
    "\n", num, num, num, num, num, num);

// 应用：输出时间格式 12:08:03
int hour = 12, minute = 8, second = 3;
printf("最小宽度为2，右对齐，如果宽度不足2，则在左边补0："
        "%02d:%02d:%02d"
        "\n", hour, minute, second);
~~~

相比之下，stream 的填补更加灵活，可以自定义填补字符，而且 “左右对齐” 和 “填补字符” 可以自由组合

**注意**，stream 在设置最小宽度时使用的  

- 流控制符 `std::setw(int __n)`
- 成员函数 `std::cout.width(std::streamsize __wide)`

**仅对下一个输入有效**，因此需要不断使用

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::setw;
using std::right;
using std::left;
using std::setfill;
using std::resetiosflags;
using std::ios;
double num = 4.0;

// 注意，对于浮点数，stream 们的默认输出相当于 printf 的 %g
cout << "最小宽度为11，右对齐：" << setw(11) << num << setw(11) << num << '\n'
    << "最小宽度为11，左对齐：" << left
                            << setw(11) << num << setw(11) << num << '\n'
                            << resetiosflags(ios::left)
    
    << "最小宽度为11，右对齐，左边空白补0：" << right
                                        << setfill('0') << setw(11) << num
                                        << setfill(' ') << setw(11) << num << '\n'
                                        << resetiosflags(ios::right)
                                        
    << "最小宽度为11，左对齐，右边空白补*：" << left
                                        << setfill('*') << setw(11) << num
                                        << setfill(' ') << setw(11) << num << endl
                                        << resetiosflags(ios::left);

// 应用：输出时间格式 12:08:03
int hour = 12, minute = 8, second = 3;
cout << "最小宽度为2，右对齐，如果宽度不足2，则在左边补0："
    << setfill('0')
    << setw(2) << hour << ':'
    << setw(2) << minute << ':'
    << setw(2) << second << endl;
cout.fill(' ');
~~~

printf 用 `+` 为十进制正数输出正号  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 空格 将十进制数的正号换成空格  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 `#` 为八进制和十六进制数输出 `0` 和 `0x`

- 一类：进制号 `#` | 十进制正号 `+` > 十进制空格 ` `
- 二类：左对齐 `-` > 补零 `0`

一类和二类自由组合

~~~c
// C code
// 应用：避免输出 “+-6”
int a = 2, b = 3, c = -6;
printf("平面上某直线的一般方程：%dx%+dy%+d=0"
    "\n正号 补0 最小宽度：%+07d%0+7d"
    "\n左对齐 进制号 最小宽度：%#-7x%-#7x%d"
    "\n", a, b ,c, 1, 2, 3, 4, 5);
~~~

stream 用 流操作符 `showpos` 为十进制正数输出正号  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用 流操作符 `showbase` 为八进制和十六进制数输出 `0` 和 `0x`

~~~cpp
// C++ code
// 应用：避免输出 “+-6”
using std::cout;
using std::endl;
using std::showpos;
using std::resetiosflags;
using std::ios;
int a = 2, b = 3, c = -6;
cout << "平面上某直线的一般方程："
    << a << 'x'
    << showpos
    << b << 'y' << c << "=0" << endl
    << resetiosflags(ios::showpos);
~~~

## 小数

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
printf("动态控制最小宽度、精度：%+-*.*f"
        "\n", leastWide, precision, small);
~~~

stream 则较为灵活

~~~cpp
// C++ code
using std::cout;
using std::endl;
using std::setprecision;
using std::showpoint;
using std::resetiosflags;
using std::ios;
using std::fixed;
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
    << "small = " << small << ", big = " << big << endl
    << setprecision(6);

// 有效数字，显示多余的0
cout << "7位有效数字，显示多余的0：\n  "
    << setprecision(7) << showpoint
    << "small = " << small << ", big = " << big << endl
    << setprecision(6) << resetiosflags(ios::showpoint);

// 普通计数法
cout << "普通计数法，小数点后7位（包括多余的0）：\n  "
    << fixed << setprecision(7)
    << "small = " << small << ", big = " << big << endl
    << setprecision(6) << resetiosflags(ios::fixed);

// 科学计数法
cout << "科学计数法，小数点后7位（包括多余的0）：\n  "
    << scientific << setprecision(7)
    << "small = " << small
    << uppercase
    << ", big = " << big << endl
    << resetiosflags(ios::scientific|ios::uppercase) << setprecision(6);
    
// 动态控制最小宽度、精度
int leastWide = 10, precision = 7;
cout << "动态控制最小宽度、精度："
    << showpos << left << fixed
    << setprecision(precision) << setw(leastWide)
    << small << endl;
cout.flags(defaultFlags), cout.precision(6);
~~~

