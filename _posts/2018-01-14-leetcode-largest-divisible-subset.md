---
layout: post
title: "LeetCode: 368. Largest Divisible Subset"
description: "最大可互除子集"
subtitle: "week 20"
create-date: 2018-01-14
update-date: 2018-01-14
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Largest Divisible Subset - LeetCode](https://leetcode.com/problems/largest-divisible-subset/description/){:target="_blank"}

Given a set of **distinct** positive integers, find the largest subset such that every pair $$(S_i, S_j)$$ of elements in this subset satisfies: $$S_i % S_j = 0$$ or $$S_j % S_i = 0$$.

If there are multiple solutions, return any subset is fine.

**Example 1:**

~~~
nums: [1,2,3]

Result: [1,2] (of course, [1,3] will also be ok)
~~~

**Example 2:**

~~~
nums: [1,2,4,8]

Result: [1,2,4,8]
~~~

**Credits:**

Special thanks to @Stomach_ache for adding this problem and creating all test cases.

# Solution

## my naive solution (33 ms)

一个集合内所有整数可以互相整除，那么这些整数从小到大排序的话，是可以串成一条链的。

如果把 $$a \% b = 0, a \neq b$$ 作为 ``b -> a`` 的边，给定集合里每个数为一个结点，那么题目求的实际上是有向无环图中点和点之间的最长距离。

可以模拟 Dijkstra 算法的思路。先对集合中的整数排序，然后选一个到距某个起点最小的点（用 ``.dist`` 记录这个距离），观察它射出去的各个边的端点（即比它大的那些能整除它的点），看看是某个起点到新端点的已有距离大（即新端点的 ``.dist``），还是通过当前端点到新端点的距离大。

由于题目要给出集合序列，所以还要做额外的工作。记录最大距离的端点，然后通过在更新端点 ``.dist`` 时，设置每个端点的 ``.src``，做到能从最大距离的端点回溯到起点。

# Source Code

## submission

~~~cpp
#include <vector>
#include <algorithm>

class Solution {
  struct Point {
    int dist;
    int src;
    Point(): dist(0), src(-1) {}
  };
 public:
  std::vector<int> largestDivisibleSubset(std::vector<int>& nums) {
    const int n = nums.size();
    std::vector<int> ret;
    if (n == 0) {
      return ret;
    }
    std::sort(nums.begin(), nums.end());

    std::vector<Point> points(n, Point());

    int max_point = 0;
    for (int cur_index = 0; cur_index < n; cur_index += 1) {
      for (int end_index = cur_index + 1; end_index < n; end_index += 1) {
        if (nums[end_index] % nums[cur_index]) {
          continue;
        }
        if (points[end_index].dist < points[cur_index].dist + 1) {
          points[end_index].dist = points[cur_index].dist + 1;
          points[end_index].src = cur_index;
          if (points[max_point].dist < points[end_index].dist) {
            max_point = end_index;
          }
        }
      }
    }

    ret.resize(points[max_point].dist + 1, 0);
    int ptr = points[max_point].dist;
    while (max_point != -1) {
      ret[ptr] = nums[max_point];
      ptr -= 1;
      max_point = points[max_point].src;
    }
    return std::move(ret);
  }
};

~~~

## framework

~~~c
#include <iostream>

/* ================== submission begins ===================== */
#include <vector>
#include <algorithm>

class Solution {
  struct Point {
    int dist;
    int src;
    Point(): dist(0), src(-1) {}
  };
 public:
  std::vector<int> largestDivisibleSubset(std::vector<int>& nums) {
    const int n = nums.size();
    std::vector<int> ret;
    if (n == 0) {
      return ret;
    }
    std::sort(nums.begin(), nums.end());

    std::vector<Point> points(n, Point());

    int max_point = 0;
    for (int cur_index = 0; cur_index < n; cur_index += 1) {
      for (int end_index = cur_index + 1; end_index < n; end_index += 1) {
        if (nums[end_index] % nums[cur_index]) {
          continue;
        }
        if (points[end_index].dist < points[cur_index].dist + 1) {
          points[end_index].dist = points[cur_index].dist + 1;
          points[end_index].src = cur_index;
          if (points[max_point].dist < points[end_index].dist) {
            max_point = end_index;
          }
        }
      }
    }

    ret.resize(points[max_point].dist + 1, 0);
    int ptr = points[max_point].dist;
    while (max_point != -1) {
      ret[ptr] = nums[max_point];
      ptr -= 1;
      max_point = points[max_point].src;
    }
    return std::move(ret);
  }
};

/* ================== submission ends ===================== */

int main() {
  Solution s;
  std::vector<int> nums {1, 2, 4, 6, 8};
  for (const auto &one : s.largestDivisibleSubset(nums)) {
    std::cout << one << " ";
  }
  std::cout << std::endl;
}

~~~

