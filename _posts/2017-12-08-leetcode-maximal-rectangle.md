---
layout: post
title: "LeetCode: 85. Maximal Rectangle"
description: "求 0-1 矩阵中，只含 1 的矩形的最大面积"
subtitle: "week 14"
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

> [Maximal Rectangle - LeetCode](https://leetcode.com/problems/maximal-rectangle/description/){:target="_blank"}

Given a 2D binary matrix filled with 0's and 1's, find the largest rectangle containing only 1's and return its area.

For example, given the following matrix:

~~~plain
1 0 1 0 0
1 0 1 1 1
1 1 1 1 1
1 0 0 1 0
~~~

Return 6.

# Solution

## my naive solution (∞ ms)

too naive to figure out a solution...

## better solution (6 ms)

利用 [Largest Rectangle in Histogram](https://mensu.github.io/2017/10/08/leetcode-largest-rectangle-in-histogram){:target="_blank"} 的成果，将矩阵看做一个个直方图。

例如，题目给的矩阵可以看做下面 4 个直方图（把接地的 ``1`` 和上面紧密相连的 ``1`` 想象成柱体）

~~~plain
 1 0 1 0 0
(1 0 1 0 0)
~~~

~~~plain
 1 0 1 0 0
 1 0 1 1 1
(2 0 2 1 1)
~~~

~~~plain
 1 0 1 0 0
 1 0 1 1 1
 1 1 1 1 1
(3 1 3 2 2)
~~~

~~~plain
 1 0 1 0 0
 1 0 1 1 1
 1 1 1 1 1
 1 0 0 1 0
(4 0 0 3 0)
~~~

这 4 个直方图的最大矩形面积中，最大的那个就是答案。

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

int maximalRectangle(char **matrix, int matrixRowSize, int matrixColSize) {
  int max = 0;
  int *heights = calloc(sizeof(int), matrixColSize);
  for (int row = 0; row < matrixRowSize; ++row) {
    for (int col = 0; col < matrixColSize; ++col) {
      if (matrix[row][col] == '0') {
        heights[col] = 0;
      } else {
        heights[col] += 1;
      }
    }
    int tmp = largestRectangleArea(heights, matrixColSize);
    if (max < tmp) {
      max = tmp;
    }
  }
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

int maximalRectangle(char **matrix, int matrixRowSize, int matrixColSize) {
  int max = 0;
  // 每个柱体的高度
  int *heights = calloc(sizeof(int), matrixColSize);
  for (int row = 0; row < matrixRowSize; ++row) {
    for (int col = 0; col < matrixColSize; ++col) {
      // 计算柱体的高度
      if (matrix[row][col] == '0') {
        heights[col] = 0;
      } else {
        heights[col] += 1;
      }
    }
    // 求最大面积
    int tmp = largestRectangleArea(heights, matrixColSize);
    if (max < tmp) {
      max = tmp;
    }
  }
  return max;
}


/* ================== submission ends ===================== */

int main() {
#define ROW 15
#define COL 15
  char matrixRaw[ROW][COL] = {
    {'1', '1', '1', '1', '1', '1', '0', '1', '1', '1', '1', '1', '1', '1', '1'},
    {'1', '0', '1', '1', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'},
    {'1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'},
    {'0', '1', '1', '1', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1'},
    {'1', '0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '1', '1', '1'},
    {'1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'},
    {'1', '1', '1', '0', '1', '1', '1', '1', '1', '1', '1', '0', '1', '1', '1'},
    {'1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '1', '0', '1', '0'},
    {'1', '0', '1', '1', '0', '0', '0', '1', '1', '1', '1', '0', '1', '0', '1'},
    {'1', '0', '1', '1', '1', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1'},
    {'1', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'},
    {'1', '1', '1', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'},
    {'1', '1', '1', '0', '0', '0', '1', '0', '1', '1', '1', '1', '1', '1', '1'},
    {'1', '1', '1', '1', '1', '1', '0', '1', '1', '1', '1', '1', '1', '1', '1'},
    {'1', '1', '1', '1', '1', '1', '1', '0', '1', '1', '1', '1', '1', '0', '1'},
  };

  char *matrix[COL];
  for (int i = 0; i < ROW; ++i) {
    matrix[i] = matrixRaw[i];
  }
  // expect 30 (2 * 15)
  printf("%d\n", maximalRectangle(matrix, ROW, COL));
}

~~~
