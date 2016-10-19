---
layout: post
title: "合并排序"
description: "我对合并排序的理解"
subtitle: "merge sort"
create-date: 2016-02-20
update-date: 2016-03-17
header-img: ""
author: "Mensu"
tags:
    - 排序
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# 合并排序的核心部分

## 打个比方
合并排序的核心，是将两个**内部有序**的数组，合并为一个有序的数组

具体的想法很好理解，有点类似于两个队伍打比赛

队伍都按照**由弱到强**的顺序派出队员，每次都是1v1的个人赛，赢的人留在台上做擂主，输的人排入休息队伍【别问为啥&nbsp;\|･ω･｀)  
然后，输者的队伍继续派出队员，直到有一个队伍的人都派完了，才把另一个队伍的人按顺序接到输者休息队伍的后面

这样以后，休息队伍就是按由弱到强的顺序排的啦


## 举个栗子
下面的 beforemerger 数组里存有两个待合并的数组，分别是 1、2、4、5 和 3、5、6、7。aftermerger 储存排序后的数组。用 p1、p2、p 三个“指针”表示三个会移动的下标

“指针”的说法只是为了形象地表示箭头，和C语言储存地址的指针无关

<a class="view-again" href="javascript:;">从头看起 <i class="fa fa-refresh"></i></a>

![an example for merge sort](http://7xrahq.com1.z0.glb.clouddn.com/merge-sort-merge-sort.gif)

从上面的例子，可以看出核心部分分为两个阶段：两个组的**交叉**填入阶段、剩下一个组剩余内容的**移入**阶段

## 交叉
这个阶段就是循环 < 比较大小、移动指针 >，直到指针出界。根据上面的栗子，具体过程可以抽象为下面的内容：

~~~ c
// invalid code
loop {
    if (beforemerger[p1] <= beforemerger[p2]) {   // p1的数小
        aftermerger[p] = beforemerger[p1];        // 就将p1的数填入
        p1++, p++;                                // 移动指针
    }
    else {                                   // p2的数小
        aftermerger[p] = beforemerger[p2];   // 就将p2的数填入
        p2++, p++;                           // 移动指针
    }
     // 用end1表示第一组最后一个数的下标（末下标），end2表示第二组的末下标
} until (p1 > end1 || p2 > end2);            // 有一组的指针出界，本阶段结束
~~~

仔细观察上面的代码，不难发现条件判断其实是把**不同条件下的不同值**赋给**相同的变量 aftermerger[p]**，以及不同的指针后移，于是可以考虑下面的形式：

~~~ c
// C code
aftermerger[p] = (beforemerger[p1] <= beforemerger[p2]) ? beforemerger[p1] : beforemerger[p2];
(beforemerger[p1] <= beforemerger[p2]) ? p1++ : p2++;
p++;
 
~~~

或者更为简洁的

~~~ c
// C code
aftermerger[p++] = (beforemerger[p1] <= beforemerger[p2]) ? beforemerger[p1++] : beforemerger[p2++];
 
~~~

当然，简洁的另一面，代码的可读性在一定程度上会有所下降

再对 loop...until 进行转换，就得到了

~~~ c
// C code
while (p1 <= end1 && p2 <= end2) aftermerger[p++] = (beforemerger[p1] <= beforemerger[p2]) ? beforemerger[p1++] : beforemerger[p2++];
 
~~~

## 移入
移入阶段，如果是第一组有剩余，则循环 < 将第一组 p1 以后的数分别存入aftermerger、移动指针 >；如果第二组有剩余也类似

~~~ c
// invalid code
if (p1 <= end1) {                            // p1所在组有剩余的情况
    loop {
        aftermerger[p] = beforemerger[p1];   // 存入aftermerger
        p1++, p++;                           // 移动指针
    } until (p1 > end1);                     // p1指针也出界了，结束
}
else if (p2 <= end2) {                       // p2所在组有剩余的情况，同理
    loop {
        aftermerger[p] = beforemerger[p2];  
        p2++, p++;
    } until (p2 > end2);
}
~~~

交叉阶段的结束，意味着 `p1 <= end1` 和 `p2 <= end2` 中必有一种不成立，而且这两种情况是互斥的。因此可以大胆地去掉 else，而不用担心两个 if 内的语句都被执行
在此基础上合并 if ... loop ...until，可以得到更简洁的代码

~~~ c
// C code
while (p1 <= end1) aftermerger[p++] = beforemerger[p1++];
while (p2 <= end2) aftermerger[p++] = beforemerger[p2++];
~~~

下面的版本只有一行，但似乎增加了比较次数，可读性也比上面的差些，我是不太喜欢

~~~ c
// C code
while (p1 <= end1 || p2 <= end2) aftermerger[p++] = (p1 <= end1) ? beforemerger[p1++] : beforemerger[p2++];
 
~~~

## 核心部分的代码
~~~ c
// C code
while (p1 <= end1 && p2 <= end2) aftermerger[p++] = (beforemerger[p1] <= beforemerger[p2]) ? beforemerger[p1++] : beforemerger[p2++];
while (p1 <= end1) aftermerger[p++] = beforemerger[p1++];
while (p2 <= end2) aftermerger[p++] = beforemerger[p2++];
 
~~~

可以看出，核心部分用到了5个关键的下标：
<style type="text/css">
p.pre-wrap-center {
  text-align: center;
  white-space: pre-wrap;
}
</style>
<p class="pre-wrap-center">p = p1 = 第一组首下标
end1 = 第一组末下标
p2 = 第二组首下标
end2 = 第二组末下标</p>

甚至可以认为，无论每组有多少个数，只要每组的首下标和末下标设置好，就可以进行合并排序的核心部分

# 合并排序的迭代部分

## 迭代思路
迭代的意思是把循环中这一轮的结果用于下一轮

根据合并排序的核心部分，可以这么想：用合并排序核心部分把**两个内部有序的小组**合并成**一个内部有序大组**（这一轮的结果），再拿这个大组和另外一个大组进行合并排序（用于下一轮），得到更大的组，再……

假如一开始就把一个无序的数组分成很多个小组，**例如，每个数自成一组，**按上面的想法合并这些内部有序的小组，再合并得到的内部有序的大组，这样下去，最终便可以把原数组变成内部有序的大组，即通过合并排序给整个数组排了序

要是我们把核心部分视为最小单位，那么迭代部分就是**从左到右（内）**和**从上到下（外）**的两层循环，举个栗子：

<a class="view-again" href="javascript:;">从头看起 <i class="fa fa-refresh"></i></a>

 ![an example for merge sort iteration](http://7xrahq.com1.z0.glb.clouddn.com/merge-sort-merge-sort-iteration.gif)

先**从左到右循环核心部分**：两个两个小组用核心部分排序

然后再**从上到下循环**前面的**从左到右**：发生迭代，把本轮从左到右循环的结果用于下一轮，每轮一个小组的大小是上一次两个小组大小之和，也就是上一次一个小组的两倍。这里暂时忽略了末尾的特殊情况

## 从左到右

先看从左到右的内循环，循环的内容是核心部分

### 小组指针初始化

在运用核心部分进行排序之前，要设置好每组的首尾指针，也就是说让 beforemerger 中两小组的首尾指针指向正确的位置

容易发现，进行核心部分之后，aftermerger 中的 p 指针总是能自动指向正确的位置——第一组的第一个元素——因此在从左到右的内循环中不需要刻意修改

这里我们使用 seg 表示每个标准小组的长度（元素数目），seg 的变化——每轮的长度是上一轮的两倍——将在外循环中修改

~~~ c
// C code
p1 = p;
p2 = p1 + seg;
end1 = p2 - 1;
end2 = end1 + seg;
~~~

#### 两种特殊情况
现在考虑末尾的特殊情况。因为标准小组的长度 seg 是 2 的 n 次方，而原数组的长度不一定恰好为 2 * seg 的倍数，也就是说最后可能剩下一些数，数量不足以凑成 2 个标准小组参与合并。不用害怕，我们要做的，还是**让每组的首尾指针指向正确的位置**。这样一来，如前面所说，就可以正确地进行核心部分。有如下两种特殊情况

一种是**最后有两组**能参与合并排序，但第二组里的数少于标准小组。这时只要**把第二组的尾指针调整向** rightmost——**下标最大值**  
这种情况的本质是 正常情况下的 end2（= end1 + seg） 超过了 rightmost，此时要将 end2 调整为 rightmost  
我们力求修改后的代码也能用于前面的正常情况

~~~ c
// C code
if (end1 + seg > rightmost) {    // 第一种情况的本质：end1 + seg 超过了 rightmost
	end2 = rightmost;
} else {                         // 正常情况
	end2 = end1 + seg;
}
~~~

化简得

~~~ c
// C code
end2 = ((end1 + seg > rightmost) ? rightmost : end1 + seg);
~~~

另一种则是**最后只有一组**能参与合并排序。我们可以认为，“第二组”的长度是0，于是，不用排了，这最后一组直接晋级下一轮外循环。这种情况的本质是 正常算得的 end1（= p2 - 1）等于或超过了 rightmost，此时需要修改 end1，使 end1 指向 rightmost

~~~ c
// C code
end1 = ((p2 - 1 >= rightmost) ? rightmost : p2 - 1);
~~~

不难发现，条件里的等号去掉也不会对结果造成影响

~~~ c
// C code
end1 = ((p2 - 1 > rightmost) ? rightmost : p2 - 1);
~~~

然后，直接晋级，也就是说核心阶段里只想要执行这句话

~~~ c
// C code
while (p1 <= end1) aftermerger[p++] = beforemerger[p1++]; 
~~~
 
那么，破坏其他两句的条件 `` p2 <= end2 `` ，让 p2 > end2 就行了。很幸运，如果沿用第一种特殊情况的

~~~ c
// C code
end2 = ((end1 + seg > rightmost) ? rightmost : end1 + seg);
~~~

考虑到 end1 此时的位置 end1 = rightmost，代入上面的代码，结果必然是 end2 = rightmost。那么根据第二种特殊情况的本质—— p2 - 1 >= rightmost ，立即推出
<p class="pre-wrap-center">p2 > p2 - 1 ≥ rightmost = end2</p>
可见，沿用第一种特殊情况的代码还能顺便破坏 `` p2 <= end2 `` ，不用再写其他代码。但要注意 end1 那句要放在 end2 的前面

考虑上特殊情况，小组指针初始化的代码如下：

~~~ c
// C code
p1 = p;
p2 = p + seg;
end1 = ((p2 - 1 > rightmost) ? rightmost : p2 - 1);
end2 = ((end1 + seg > rightmost) ? rightmost : end1 + seg);
~~~

### for循环
从左到右内循环的主体就这样搭建完成了：“小组指针初始化” + “核心部分“  
考虑内循环的开始——要为五指针声明，然后要把 aftermerger 中的 p 初始化为 0  
而内循环的终止条件，便是 p 指针遍历了所有的元素，溢出 aftermerger 数组的最右 rightmost 。反过来内循环还要继续的条件，是p指针尚未越过 rightmost。  
由此可以构造 for 循环：

~~~ c
// C code
for (int p = 0, p1, p2, end1, end2; p <= rightmost;) {
    // 小组指针初始化
    // 核心部分
}
~~~

### 从左到右循环的代码
~~~ c
// C code
for (int p = 0, p1, p2, end1, end2; p <= rightmost;) {
    /*----- 小组指针初始化 -----*/
    p1 = p;
    p2 = p + seg;
    end1 = ((p2 - 1 > rightmost) ? rightmost : p2 - 1);
    end2 = ((end1 + seg > rightmost) ? rightmost : end1 + seg);
    
    /*----- 核心部分 -----*/
    while (p1 <= end1 && p2 <= end2) aftermerger[p++] = (beforemerger[p1] <= beforemerger[p2]) ? beforemerger[p1++] : beforemerger[p2++];
    while (p1 <= end1) aftermerger[p++] = beforemerger[p1++];
    while (p2 <= end2) aftermerger[p++] = beforemerger[p2++];
}
 
~~~

## 从上到下

### 迭代思路

从上到下循环的内容是上面从左到右的部分

每进行一次从左到右，就会两组两组合并，得到一些更大的组。不考虑特殊情况的话，每一轮，每组的长度 seg 都会翻倍。最开始我们是一个数一组，seg = 1，这是初始条件。然后每轮 seg 翻倍，seg = seg * 2 。这便是每轮结束时要为下一轮做的事情

那什么时候合并得只剩一个组——排序后的数组呢？不妨从另一个角度考虑：什么时候还得继续合并呢？当然是仍剩下多个小组的时候啦！此时每个小组长度必然小于原数组，这对应条件：`seg ≤ rightmost`  
由此可以构造 for 循环：

~~~ c
// C code
for (int seg = 1; seg <= rightmost; seg <<= 1) {
    //从左到右内循环
}
~~~

`seg = seg * 2` 换成 `seg <<= 1` ，一方面是为了装逼，另一方面，据说可以提高计算效率

之前说过，外循环发生迭代，将本轮的结果用于下一轮，在合并排序的例子里，就是将 aftermerger 的结果用于下一轮。怎么用？当然是使得 本轮末的 aftermerger 成为下一轮初的 beforemerger。于是有：

~~~ c
// C code
beforemerger = aftermerger;
~~~

鉴于合并前数组长什么样已经没用了，那不妨利用起 beforemerger 对应的空间，把它当做下一轮存放合并后数组的容器，即下一轮的 aftermerger。这样，每轮从左到右内循环之前，我们要做的是交换 beforemerger 和 aftermerger 对应的空间。

~~~ c
// C code
temp = beforemerger, beforemerger = aftermerger, aftermerger = temp;
~~~

### 从上到下循环的代码
~~~ c
// C code
for (int seg = 1; seg <= rightmost; seg <<= 1) {
    /*----- 交换 beforemerger 和 aftermerger -----*/
    temp = beforemerger, beforemerger = aftermerger, aftermerger = temp;
    /*----- 从左到右内循环 -----*/
    for (int p = 0, p1, p2, end1, end2; p <= rightmost;) {
        p1 = p, p2 = p + seg;
        end1 = ((p2 - 1 > rightmost) ? rightmost : p2 - 1);
        end2 = ((end1 + seg > rightmost) ? rightmost : end1 + seg);
        
        while (p1 <= end1 && p2 <= end2) aftermerger[p++] = (beforemerger[p1] <= beforemerger[p2]) ? beforemerger[p1++] : beforemerger[p2++];
        while (p1 <= end1) aftermerger[p++] = beforemerger[p1++];
        while (p2 <= end2) aftermerger[p++] = beforemerger[p2++];
    }
}
 
~~~

# 合并排序前后

## 准备
合并排序需要的信息有原数组 array 以及原数组下标最大值 rightmost。一切开始之前，要准备好 temp、beforemerger、aftermerger 三个指针。beforemerger 自然应该是原数组 array，而第一次使用 aftermerger 时，要给它一块装得下原数组的空间。考虑到交换的部分，不妨先把原数组 array 赋给 aftermerger，而把新空间赋给 beforemerger，这样，在第一次交换后，就能达到预期的效果。

~~~ c
// C code
void mergesort(int rightmost, int *array) {
    int *beforemerger, *aftermerger, *temp;
    beforemerger = malloc(sizeof(int) * (rightmost + 1)), aftermerger = array;
    
    // 合并排序（从上到下循环）
}
~~~

## 善后
合并排序完了，得到的 aftermerger 就是我们要的排序后数组。合并排序过程中，我们实际上是把原数组 array 的空间和一开始申请的新空间轮流换给 beforemerger 和 aftermerger，换来换去，也不知道最终谁是谁

如果结束后 aftermerger 用的就是原数组 array 的空间，那就省心了，接下来释放掉 beforemerger 对应的新空间就好了。要是结束后 aftermerger 用的是新申请的那块新空间，那还要把 aftermerger 里的结果复制回原数组 array 的空间去，这种情况下原数组的空间是 beforemerger 了

~~~ c
// C code

// 合并排序（从上到下循环）
if (aftermerger != array) {
    for (int i = 0; i <= rightmost; i++) array[i] = aftermerger[i];
    free(aftermerger);
}
else free(beforemerger);
~~~

# 模块搭建

~~~ c
/*----- 准备 -----*/
    // 三指针声明
    // 初始化
/*----- 合并排序（从上到下外循环） -----*/
for (int seg = 1; seg <= rightmost; seg <<= 1) {
    // 交换 beforemerger 和 aftermerger
        
	/*----- 从左到右内循环 -----*/
    for (int p = 0, p1, p2, end1, end2; p <= rightmost;) {
        /*----- 小组指针初始化 -----*/
	        // 四个小组指针，注意end1、end2的特殊情况
        /*----- 核心部分 -----*/
	        // 交叉
	        // 移入
    }
}
/*----- 善后 -----*/
    // 结果复制回 array
    // free
~~~

# 合并排序的代码

~~~ c
// C code
#include <stdio.h>
#include <stdlib.h>
void mergesort(int rightmost, int *array) {
    int *beforemerger, *aftermerger, *temp;
    beforemerger = malloc(sizeof(int) * (rightmost + 1)), aftermerger = array;
    for (int seg = 1; seg <= rightmost; seg <<= 1) {
        temp = beforemerger, beforemerger = aftermerger, aftermerger = temp;
        for (int p = 0, p1, p2, end1, end2; p <= rightmost;) {
            p1 = p, p2 = p + seg;
            end1 = ((p2 - 1 > rightmost) ? rightmost : p2 - 1);
            end2 = ((end1 + seg > rightmost) ? rightmost : end1 + seg);
            while (p1 <= end1 && p2 <= end2) aftermerger[p++] = (beforemerger[p1] <= beforemerger[p2]) ? beforemerger[p1++] : beforemerger[p2++];
            while (p1 <= end1) aftermerger[p++] = beforemerger[p1++];
            while (p2 <= end2) aftermerger[p++] = beforemerger[p2++];
        }
    }
    if (aftermerger != array) {
        for (int i = 0; i <= rightmost; i++) array[i] = aftermerger[i];
        free(aftermerger);
    }
    else free(beforemerger);
}
 
~~~

# 参考文献

[归并排序 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/归并排序#C.E8.AA.9E.E8.A8.80){:target="_blank"}