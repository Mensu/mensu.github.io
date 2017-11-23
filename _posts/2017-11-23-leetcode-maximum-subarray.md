---
layout: post
title: "LeetCode: 53. Maximum Subarray"
description: "和最大的子数组"
subtitle: "week 10"
create-date: 2017-11-23
update-date: 2017-11-23
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Easy
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Maximum Subarray - LeetCode](https://leetcode.com/problems/longest-valid-parentheses/description/){:target="_blank"}

Find the contiguous subarray within an array (containing at least one number) which has the largest sum.

For example, given the array ``[-2,1,-3,4,-1,2,1,-5,4]``,

the contiguous subarray ``[4,-1,2,1]`` has the largest sum = ``6``.

# Solution

## my naive solution (∞ ms)

too naive to figure out a solution, albeit Easy...

## better solution (3 ms)

看了讨论，果真十分 ``Easy``，然而我太菜了。

思路是，从左到右扫描，考察数组 ``arr[0:i]`` 的连续子数组的最大和

``arr[0:i]`` 的连续子数组有两种：以 ``arr[i]`` 结尾、不以 ``arr[i-1]`` 结尾

最大和就是他们之中的最大值，即以 ``arr[i]`` 结尾的连续子数组的最大和、不以 ``arr[i]`` 结尾的连续子数组的最大和 (1)

假设已经有了以 ``arr[0:i-1]`` 的情报，那对于新来的 ``arr[i]``，想得到 ``arr[0:i]`` 的连续子数组的最大和：

- 如果取到最大和的连续子数组以 ``arr[i]`` 结尾，那会有两种情况：加上包含 ``arr[i-1]`` 的 ``arr[0:i-1]`` 的最大和 ``arr[0:i-1] + arr[i]``，或者，另起炉灶只使用 ``arr[i]`` (2)
- 如果取到最大和的连续子数组不以 ``arr[i]`` 结尾，那就是看 ``arr[0:i-1]`` 的最大和了 (3)

# Source Code

## submission

~~~c
int maxSubArray(const int *nums, int nums_size) {
  if (nums_size == 1) {
    return nums[0];
  }
  int max_sum_without_prev = nums[0];
  int max_sum_with_prev = nums[0];
  for (int index = 1; index < nums_size; ++index) {
    // (2) (3)
    max_sum_without_prev = max_sum_without_prev > max_sum_with_prev ? max_sum_without_prev : max_sum_with_prev;
    // (1)
    max_sum_with_prev = nums[index] + (max_sum_with_prev > 0 ? max_sum_with_prev : 0);
  }
  // (3)
  return max_sum_without_prev > max_sum_with_prev ? max_sum_without_prev : max_sum_with_prev;
}

~~~

## framework

~~~c
#include <stdio.h>

/* ================== submission begins ===================== */

int maxSubArray(const int *nums, int nums_size) {
  if (nums_size == 1) {
    return nums[0];
  }
  int max_sum_without_prev = nums[0];
  int max_sum_with_prev = nums[0];
  for (int index = 1; index < nums_size; ++index) {
    // (2) (3)
    max_sum_without_prev = max_sum_without_prev > max_sum_with_prev ? max_sum_without_prev : max_sum_with_prev;
    // (1)
    max_sum_with_prev = nums[index] + (max_sum_with_prev > 0 ? max_sum_with_prev : 0);
  }
  // (3)
  return max_sum_without_prev > max_sum_with_prev ? max_sum_without_prev : max_sum_with_prev;
}

/* ================== submission ends ===================== */

int main() {
  {
    int arr[] = {-9,-3,2,8,-6,5,2,-3,-9,5,-5,-1,9,-7,4,0,1,7,-4};
    // 14
    printf("%d\n", maxSubArray(arr, sizeof(arr) / sizeof(int)));
  }
  {
    int arr[] = {1,-2,0};
    // 1
    printf("%d\n", maxSubArray(arr, sizeof(arr) / sizeof(int)));
  }
  {
    int arr[] = {1,2,-1,-2,2,1,-2,1};
    // 3
    printf("%d\n", maxSubArray(arr, sizeof(arr) / sizeof(int)));
  }
  {
    int arr[] = {-2, 1};
    // 1
    printf("%d\n", maxSubArray(arr, sizeof(arr) / sizeof(int)));
  }
  {
    int arr[] = {-2, -1};
    // -1
    printf("%d\n", maxSubArray(arr, sizeof(arr) / sizeof(int)));
  }
  {
    int arr[] = {-2,1,-3,4,-1,2,1,-5,4};
    // 4 -1 2 1 = 6
    printf("%d\n", maxSubArray(arr, sizeof(arr) / sizeof(int)));
  }
  {
    int arr[] = {-2,1,-3,4,-1,-1,2,1,-5,4};
    // 4 -1 -1 2 1 = 5
    printf("%d\n", maxSubArray(arr, sizeof(arr) / sizeof(int)));
  }
  {
    int arr[] = {-2,1,-3,-2,6,4,-1,2,1,-5,4};
    // 6 4 -1 2 1 = 12
    printf("%d\n", maxSubArray(arr, sizeof(arr) / sizeof(int)));
  }
}

~~~
