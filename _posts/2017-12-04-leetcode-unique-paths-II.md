---
layout: post
title: "LeetCode: 63. Unique Paths II"
description: "不同路径数目 II"
subtitle: "week 12"
create-date: 2017-12-04
update-date: 2017-12-04
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Unique Paths II - LeetCode](https://leetcode.com/problems/unique-paths-ii/description/){:target="_blank"}

Follow up for "Unique Paths":

Now consider if some obstacles are added to the grids. How many unique paths would there be?

An obstacle and empty space is marked as ``1`` and ``0`` respectively in the grid.

For example,
There is one obstacle in the middle of a 3x3 grid as illustrated below.

~~~plain
[
  [0,0,0],
  [0,1,0],
  [0,0,0]
]
~~~

The total number of unique paths is ``2``.

Note: m and n will be at most 100.

**Note:** *m* and *n* will be at most 100.

# Solution

## my naive solution (0 ms)

从上到下从左到右计算每个格子的不同路径数。每个格子的不同路径值就是它左边的格子的路径数加上它上面的格子的路径数。如果某个格子是障碍，那就不能加上它的路径数，毕竟不能从障碍出发继续走，因此不妨把它的路径数设为 ``0``

# Source Code

## submission

~~~c
#include <stdlib.h>

int uniquePathsWithObstacles(int** obstacleGrid, int obstacleGridRowSize, int obstacleGridColSize) {
  int *cur = calloc(sizeof(int), obstacleGridColSize);
  int *prev = malloc(sizeof(int) * obstacleGridColSize);
  cur[0] = 1;
  for (int row = 0; row < obstacleGridRowSize; ++row) {
    int *tmp = cur;
    cur = prev;
    prev = tmp;
    for (int col = 0; col < obstacleGridColSize; ++col) {
      if (obstacleGrid[row][col] == 1) {
        cur[col] = 0;
      } else if (col) {
        cur[col] = cur[col - 1] + prev[col];
      } else {
        cur[col] = prev[col];
      }
    }
  }
  int ret = cur[obstacleGridColSize - 1];
  free(cur);
  free(prev);
  return ret;
}

~~~

## framework

~~~c
#include <stdio.h>

/* ================== submission begins ===================== */
#include <stdlib.h>

int uniquePathsWithObstacles(int** obstacleGrid, int obstacleGridRowSize, int obstacleGridColSize) {
  int *cur = calloc(sizeof(int), obstacleGridColSize);
  int *prev = malloc(sizeof(int) * obstacleGridColSize);
  cur[0] = 1;
  for (int row = 0; row < obstacleGridRowSize; ++row) {
    int *tmp = cur;
    cur = prev;
    prev = tmp;
    for (int col = 0; col < obstacleGridColSize; ++col) {
      if (obstacleGrid[row][col] == 1) {
        cur[col] = 0;
      } else if (col) {
        cur[col] = cur[col - 1] + prev[col];
      } else {
        cur[col] = prev[col];
      }
    }
  }
  int ret = cur[obstacleGridColSize - 1];
  free(cur);
  free(prev);
  return ret;
}


/* ================== submission ends ===================== */

int main() {
#define m 3
#define n 3
  int grid[m][n] = {
    {0, 0, 0},
    {0, 1, 0},
    {0, 0, 0},
  };
  int *grids[m];
  for (int i = 0; i < m; ++i) {
    grids[i] = grid[i];
  }
  printf("%d\n", uniquePathsWithObstacles(grids, m, n));
}

~~~
