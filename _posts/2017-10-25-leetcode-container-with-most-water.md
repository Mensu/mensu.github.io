---
layout: post
title: "LeetCode: 11. Container With Most Water"
description: "寻找长方形面积最大的直角梯形"
subtitle: "week 8"
create-date: 2017-10-25
update-date: 2017-10-25
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Container With Most Water - LeetCode](https://leetcode.com/problems/container-with-most-water/description/){:target="_blank"}

Given $$n$$ non-negative integers $$a_1, a_2, ..., a_n$$, where each represents a point at coordinate $$(i, a_i)$$. $$n$$ vertical lines are drawn such that the two endpoints of line i is at $$(i, a_i)$$ and $$(i, 0)$$. Find two lines, which together with x-axis forms a container, such that the container contains the most water.

Note: You may not slant the container and $$n$$ is at least 2.

# Solution

## my naive solution (∞ ms)

求出每个长方形的面积

## better solution (6 ms)

看了讨论说可以通过两个指针移动进行匹配，于是 copy 了讨论的思路

简单来说就是拿两个指针从两端开始往中间靠拢，计算这个过程中形成的长方形的面积的最大值。当前指向的边是小边的指针向内靠拢。

# Source Code

## submission

~~~c
int maxArea(int *height, int heightSize) {
  int lp = 0;
  int rp = heightSize - 1;
  int lh = height[lp];
  int rh = height[rp];
  int max = lp * rp;
  int cur = 0;
  while (lp < rp) {
    cur = (rp - lp) * (lh < rh ? lh : rh);
    if (max < cur) {
      max = cur;
    }
    if (lh <= rh) {
      ++lp;
      lh = height[lp];
    } else {
      --rp;
      rh = height[rp];
    }
  }
  return max;
}

~~~

## framework

~~~c
#include <stdio.h>
#include <stdlib.h>

/* ================== submission begins ===================== */

int maxArea(int *height, int heightSize) {
  int lp = 0;
  int rp = heightSize - 1;
  int lh = height[lp];
  int rh = height[rp];
  int max = lp * rp;
  int cur = 0;
  while (lp < rp) {
    cur = (rp - lp) * (lh < rh ? lh : rh);
    if (max < cur) {
      max = cur;
    }
    if (lh <= rh) {
      ++lp;
      lh = height[lp];
    } else {
      --rp;
      rh = height[rp];
    }
  }
  return max;
}

/* ================== submission ends ===================== */

int main() {
  int heightSize = 0;
  scanf("%d", &heightSize);
  int *height = calloc(heightSize, sizeof(int));
  for (int index = 0; index < heightSize; ++index) {
    scanf("%d", &height[index]);
  }
  printf("%d\n", maxArea(height, heightSize));
}

~~~
