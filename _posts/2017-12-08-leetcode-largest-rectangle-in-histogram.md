---
layout: post
title: "LeetCode: 84. Largest Rectangle in Histogram"
description: "求直方图中的最大矩形"
subtitle: "week 13"
create-date: 2017-12-08
update-date: 2017-12-08
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Hard
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Largest Rectangle in Histogram - LeetCode](https://leetcode.com/problems/largest-rectangle-in-histogram/description/){:target="_blank"}

Given *n* non-negative integers representing the histogram's bar height where the width of each bar is 1, find the area of largest rectangle in the histogram.

![histogram](https://leetcode.com/static/images/problemset/histogram.png)

Above is a histogram where width of each bar is 1, given height = ``[2,1,5,6,2,3]``.


The largest rectangle is shown in the shaded area, which has area = ``10`` unit.

![histogram solution](https://leetcode.com/static/images/problemset/histogram_area.png)

For example,
Given heights = ``[2,1,5,6,2,3]``,
return ``10``.

# Solution

## my naive solution (∞ ms)

too naive to figure out a solution...

## better solution (3 ms)

直方图中，哪些矩形可能是最大的矩形呢？直觉告诉我们，应该是宽和高不能再扩展的矩形。此时，高应该是某个柱子的值。由此可以得到思路：对每个柱子，求以他的值为高的矩形的面积，得出里面的最大值。

那以某个柱子的高度为高的矩形，宽度是多少呢？如何知道它最大能延展到多宽呢？不难发现，对两个相邻的柱子，矮柱子能延展到高柱子那里，从而增加宽度。但高柱子却不能延展到矮柱子那里。

可以通过一个栈，在从左到右扫描的过程中，从矮到高压入栈。就是说，矮的在栈底，高的在栈顶。如果当前柱子的高度比栈顶矮，说明以栈顶柱子为高度的矩形扩展时不能越过当前柱子。同时，由于栈顶上面（刚被出栈）的柱子比栈顶高，说明栈顶柱子为高度的矩形扩展时可以越过栈顶上面（刚被出栈）的柱子。另外，由于栈顶下面的柱子比栈顶矮，说明栈顶柱子为高度的矩形扩展时也不能越过栈顶下面的柱子。例如题图中，当前柱子是倒数第二根柱子 ``2``，栈顶柱子是 ``5`` 的话，``5`` 不能越过倒数第二的当前柱子 ``2``，也不能越过正数第二的 ``1``。于是宽度就是 ``1`` 和 ``2`` 的距离，即当前柱子和栈顶下面柱子的距离。不过 ``5`` 可以越过之前出栈的 ``6``。

至此，思路就变成了在从左到右扫描的过程中，维护一个从栈底到栈顶从小到大的栈。如果无法维持，就如上一段所述，将元素出栈，计算矩形面积。最左和最右可以看做存在高度为 ``0`` 的柱体，方便整个过程。

# Source Code

## submission

~~~c
#include <stdlib.h>

int largestRectangleArea(int *heights, int heightsSize) {
  int max = 0;
  int *stack = malloc(sizeof(int) * heightsSize);
  int stackSize = 0;
  for (int index = 0; index <= heightsSize; ++index) {
    int height = index == heightsSize ? 0 : heights[index];
    while (stackSize && heights[stack[stackSize - 1]] > height) {
      // pop
      --stackSize;
      // for every curHeight in stack
      int curHeight = heights[stack[stackSize]];
      // find width = distance between height and the height under curHeight
      int curWidth = index - 1 - (stackSize ? stack[stackSize - 1] : -1);
      if (max < curHeight * curWidth) {
        max = curHeight * curWidth;
      }
    }
    // push
    stack[stackSize] = index;
    ++stackSize;
  }
  free(stack);
  return max;
}

~~~

## framework

~~~c
#include <stdio.h>

/* ================== submission begins ===================== */

#include <stdlib.h>

int largestRectangleArea(int *heights, int heightsSize) {
  int max = 0;
  int *stack = malloc(sizeof(int) * heightsSize);
  int stackSize = 0;
  for (int index = 0; index <= heightsSize; ++index) {
    int height = index == heightsSize ? 0 : heights[index];
    while (stackSize && heights[stack[stackSize - 1]] > height) {
      // pop
      --stackSize;
      // for every curHeight in stack
      int curHeight = heights[stack[stackSize]];
      // find width = distance between height and the height under curHeight
      int curWidth = index - 1 - (stackSize ? stack[stackSize - 1] : -1);
      if (max < curHeight * curWidth) {
        max = curHeight * curWidth;
      }
    }
    // push
    stack[stackSize] = index;
    ++stackSize;
  }
  free(stack);
  return max;
}


/* ================== submission ends ===================== */

int main() {
  int heights[] = {2, 1, 5, 6, 2, 3};
  printf("%d\n", largestRectangleArea(heights, sizeof(heights) / sizeof(int)));
}

~~~
