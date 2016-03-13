---
layout: post
title: "自行构建递归函数栈"
description: ""
subtitle: "use a stack to implement recursion"
create-date: 2016-03-08
update-date: 2016-03-08
header-img: ""
author: "Mensu"
tags:
    - 数据结构
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%-d" }}**.

栈的基本功能

这里简单回顾下栈的基本功能。栈可以用来实现 “后进先出” 的功能。C++ 函数中调用函数，就是以 “最后调用的函数最先处理完毕（return）” 的方式实现的

栈可以用数组、链表等方式实现。数组的方式比较简单，因为可以利用下标 `[n]` 访问每一层节点，但往往在一开始就要设定最大容量。而链表的方式容量可以动态变化，用多少，占多少

在数组方式中，使用 topIndex 指示栈顶层的下标：栈空时值为 `-1`，栈满时值为 `size - 1`  
进行 addToTop 和 removeFromTop 时要先判断栈空和栈满

我们用一类对象来储存栈的基本信息，而用另外一类对象来储存每一层的数据

~~~cpp
class stackLayer_array {
public:
    stackLayer_array(int newNum = 0);
    void setAll(const stackLayer_array& temp);
    void setNum(int newNum);
    int getNum();
private:
    int num;
};

stackLayer_array::stackLayer_array(int newNum): num(newNum) {}
void stackLayer_array::setAll(const stackLayer_array& temp) {
    num = temp.num;
}
void stackLayer_array::setNum(int newNum) {num = newNum;}
int stackLayer_array::getNum() {return num;}

class stack_array {
public:
    stack_array(int initSize);
    ~stack_array();
    
    bool isEmpty();
    bool isFull();
    stackLayer_array& getTopLayer();
    int getTopIndex();
    
    bool addToTop(const stackLayer_array& temp);
    bool removeFromTop();
    
private:
    int size;
    int topIndex;
    stackLayer_array* layers;
};

stack_array::stack_array(int initSize) :size(initSize), topIndex(-1) {
    layers = new stackLayer_array[size];
}
stack_array::~stack_array() {delete[] layers;}
bool stack_array::isEmpty() {
    if (topIndex == -1) return true;
    else return false;
}
bool stack_array::isFull() {
    if (topIndex == size - 1) return true;
    else return false;
}
stackLayer_array& stack_array::getTopLayer() {return layers[topIndex];}
int stack_array::getTopIndex() {return topIndex;}
bool stack_array::addToTop(const stackLayer_array& temp) {
    if (isFull()) return false;
    else return layers[++topIndex].setAll(temp), true;
}
bool stack_array::removeFromTop() {
    if (isEmpty()) return false;
    else return topIndex--, true;
}

~~~

递归的结构

举个简单的例子，我想打印 0、1、2 的所有排列，写出来的递归函数估计是这个样子的

~~~cpp
void printArrangement() {

}

~~~


~~~cpp
while (topIndex > -1) {
    if (/*--- 递归到达终点 ---*/) {
        
        // 干正事
        
        // return
        
    } else { /*--- 递归途中 ---*/
        
        bool Return = true;
        if (/*--- 不满足 return 条件 ---*/) {
            Return = false;
            
            // 干正事
            
            // 递归：进入新的一栈
            
        }
        
        if (/*--- Return && 满足 return 条件 ---*/) {
            // return
        }
    }
}
~~~