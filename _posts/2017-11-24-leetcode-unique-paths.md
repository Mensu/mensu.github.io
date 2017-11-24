---
layout: post
title: "LeetCode: 62. Unique Paths"
description: "不同路径数目"
subtitle: "week 11"
create-date: 2017-11-24
update-date: 2017-11-24
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Unique Paths - LeetCode](https://leetcode.com/problems/unique-paths/description/){:target="_blank"}

A robot is located at the top-left corner of a *m* x *n* grid (marked 'Start' in the diagram below).

The robot can only move either down or right at any point in time. The robot is trying to reach the bottom-right corner of the grid (marked 'Finish' in the diagram below).

How many possible unique paths are there?

![robot_maze](https://leetcode.com/static/images/problemset/robot_maze.png)

Above is a 3 x 7 grid. How many possible unique paths are there?

**Note:** *m* and *n* will be at most 100.

# Solution

## my naive solution (0 ms)

将图顺时针旋转 45 度，也就是把右上-左下方向的线变成水平线。不难看出，每一格填的数字组成杨辉三角。右上-左下方向上的点由于位于同一直线，所以其横坐标和纵坐标是一次函数关系。每一格对应的组合数 $$ C^{K}_{N} $$ 中，$$K$$ 对应**横坐标**，$$N$$ 对应右上-左下线在横轴交点的横坐标，即对应**横坐标加纵坐标**

# Source Code

## submission

~~~c
int uniquePaths(int m, int n) {
  int N = m + n - 2;
  int K = n - 1;
  if (K > N / 2) K = N - K;
  int product = 1;
  for (int i = 0; i < K; ++i) {
    product = (long long)product * (N - i) / (i + 1);
  }
  return product;
}

~~~

## framework

~~~c
#include <stdio.h>

/* ================== submission begins ===================== */

int uniquePaths(int m, int n) {
  int N = m + n - 2;
  int K = n - 1;
  if (K > N / 2) K = N - K;
  int product = 1;
  for (int i = 0; i < K; ++i) {
    product = (long long)product * (N - i) / (i + 1);
  }
  return product;
}

/* ================== submission ends ===================== */

int main() {
  int m = 0;
  int n = 0;
  scanf("%d %d", &m, &n);
  printf("%d\n", uniquePaths(m, n));
}

~~~
