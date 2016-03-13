---
layout: post
title: "常用输出格式归纳：printf 系列 和 stream 系列"
subtitle: "output format comparison between c-style printf and cpp-style stream"
create-date: 2016-03-13
update-date: 2016-03-13
header-img: ""
author: "Mensu"
tags:
    - 归纳
    - C / C++
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%-d" }}**.

说起输出格式的控制，C 中用得最多的是 printf 系列，例如 printf、fprintf、sprintf ，声明于 `<stdio.h>` ，调用时必须通过字符串设置格式  
而 C++ 中一般使用各种 stream ，例如 ostream、ofstream、ostringstream ，声明于 `<iostream>`、`<fstream>`、`<sstream>` 等，单纯地进行默认输出时十分简洁，而控制格式时则要通过自身的成员函数或者 `<iomanip>` 中的流控制符（stream manipulator），显得略微繁琐

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

或者用 `std::setbase(int __base)` 设置进制。如果传入的不是 8、10、16，则输出**十进制**

~~~cpp
// C++ code
using std::setbase;
int num = 10;
cout << "十六进制：" << setbase(16) << num << '\n'
    << "八进制：" << setbase(8) << num << '\n'
    << "十进制：" << setbase(10) << num << endl;
~~~

stream 输出格式控制中两类重要的函数：  
流控制符 `std::setiosflags(unsigned __mask)`  
和  
cout 的成员函数 `std::cout.setf(unsigned __fmtfl)`  
它们通过传入不同的参数，设置相应的输出格式  
需要传入多个参数时，用按位或运算符 `|` 连接

取消设置则使用 `std::resetiosflags(unsigned __mask)` 或  `std::cout.unsetf(unsigned __fmtfl)` 

参数是在 ios 类中定义的  
`ios::uppercase` 使十六进制的字母部分大写  
`ios::lowercase` 使十六进制的字母部分小写

~~~cpp
// C++ code
using std::setiosflags;
using std::resetiosflags;
using std::ios;
int num = 10;
// 流控制符
cout << "十六进制大写：" << hex << setiosflags(ios::uppercase) << num << '\n'
    << "取消：" << resetiosflags(ios::uppercase) << num << endl;

// 成员函数
cout.setf(ios::uppercase);
cout << "十六进制大写：" << hex << num << '\n';

cout.unsetf(ios::uppercase);
cout << "取消：" << num << endl;
~~~

## 最小宽度、左右对齐、填补、正号

printf 的填补只能在右对齐的情况下用 '0' 补左边的空白

~~~c
// C code
double num = 4.0;
printf("最小宽度为11，右对齐：%11g%11g"
    "\n最小宽度为11，左对齐：%-11g%-11g"
    "\n最小宽度为11，左边空白补0：%011g%11g"
    "\n", num, num, num, num, num, num);

// 应用：输出时间格式 12:08:03
int hour = 12, minute = 8, second = 3;
printf("最小宽度为2，右对齐，如果宽度不足2，则在左边补0："
        "%02d:%02d:%02d"
        "\n", hour, minute, second);
~~~

相比之下，stream 的填补更加灵活，可以填补任意 ASCII 码对应的字符，“左右对齐” 和 “填补字符” 可以自由组合  
**注意**，stream 在设置最小宽度时使用的  
流控制符 `std::setw(int __n)` 和 成员函数 `std::cout.width(std::streamsize __wide)`  
**仅对下一个输入有效**

~~~cpp
// C++ code
using std::setw;
using std::right;
using std::left;
using std::setfill;
double num = 4.0;

// 注意，对于浮点数，stream 们的默认输出相当于 printf 的 %g
cout << "最小宽度为11，右对齐：" << setw(11) << num << setw(11) << num << '\n'
    << "最小宽度为11，左对齐：" << left << setw(11) << num << setw(11) << num << '\n'
    
    << "最小宽度为11，右对齐，左边空白补0：" << right << setfill('0') << setw(11) << num
                                        << setfill(' ') << setw(11) << num << '\n'
                                        
    << "最小宽度为11，左对齐，右边空白补*：" << left << setfill('*') << setw(11) << num
                                        << setfill(' ') << setw(11) << num << endl << right;

// 应用：输出时间格式 12:08:03
int hour = 12, minute = 8, second = 3;
cout << "最小宽度为2，右对齐，如果宽度不足2，则在左边补0："
    << setfill('0')
    << setw(2) << hour << ':'
    << setw(2) << minute << ':'
    << setw(2) << second << endl
    << setfill(' ');
~~~

printf 用`+`输出正号  
`正号+` 和 `补零0 / 左对齐-` 自由组合

~~~c
// C code
// 应用：避免输出 “+-6”
int a = 2, b = 3, c = -6;
printf("平面上某直线的一般方程：%dx%+dy%+d=0"
    "\n正号 补0 最小宽度：%+07d%0+7d"
    "\n正号 左对齐 最小宽度：%+-7d%-+7d%d"
    "\n", a, b ,c, 1, 2, 3, 4, 5);
~~~

stream 上使用参数 `ios::showpos`

~~~cpp
// C++ code
// 应用：避免输出 “+-6”
using std::setiosflags;
using std::resetiosflags;
using std::ios;
int a = 2, b = 3, c = -6;
cout << "平面上某直线的一般方程："
    << a << 'x'
    << setiosflags(ios::showpos)
    << b << 'y' << c << "=0" << endl
    << resetiosflags(ios::showpos);
~~~

## 浮点数

未完待续

