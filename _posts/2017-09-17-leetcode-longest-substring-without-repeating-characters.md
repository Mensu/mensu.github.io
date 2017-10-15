---
layout: post
title: "LeetCode: 3. Longest Substring Without Repeating Characters"
description: "最长不重复字符子串"
subtitle: "week 2"
create-date: 2017-09-17
update-date: 2017-09-21
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Longest Substring Without Repeating Characters - LeetCode](https://leetcode.com/problems/longest-substring-without-repeating-characters/description/){:target="_blank"}

Given a string, find the length of the **longest substring** without repeating characters.

**Examples:**

Given ``"abcabcbb"``, the answer is ``"abc"``, which the length is 3.

Given ``"bbbbb"``, the answer is ``"b"``, with the length of 1.

Given ``"pwwkew"``, the answer is ``"wke"``, with the length of 3. Note that the answer must be a **substring**, ``"pwke"`` is a *subsequence* and not a substring.


# Solution

## my naive solution (22ms)

大概就是通过一个双重循环维护一个数组，每个字符对应的数组里的每个数 ``n`` 表示从该字符开始长度为 ``n`` 的子字符串不包含重复的字符。

以 ``abcbb`` 为例，数组大概是这样变化的

<style>
table td, th {
  border: 1px solid black;
  padding: 10px;
}
</style>

| # | a | b | c | b | b |
|:-:|:-:|:-:|:-:|:-:|:-:|
|(1)| 1* | 0 | 0 | 0 | 0 |
|(2)| 2* | 1* | 0 | 0 | 0 |
|(3)| 3* | 2* | 1* | 0 | 0 |
|(4)| 4* | 2 | 1 | 0 | 0 |
|(5)| 3* | 2 | 1 | 0 | 0 |
|(6)| 3 | 2 | 2* | 0 | 0 |
|(7)| 3 | 2 | 2 | 1* | 0 |

~~~c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define LENGTH 1000000

int lengthOfLongestSubstring(const char *str) {
  const size_t length = strnlen(str, LENGTH);
  size_t *counts = calloc(sizeof(size_t), length + 1);
  if (length == 0) return 0;
  size_t startPos = 0;
  size_t longestLength = 0;
  for (size_t curPos = 0; str[curPos] && curPos <= length; ++curPos) {
    const char curChar = str[curPos];
    // 内层循环检查 [startPos, curPos - 1] 范围内是否有重复字符
    for (size_t cmpPtr = startPos; cmpPtr < curPos; ++cmpPtr) {
      if (str[cmpPtr] == curChar) {  // 有重复字符
        // startPos 的计数--（刚才误加了）
        if (startPos < cmpPtr) {
          counts[startPos] -= 1;
        }
        longestLength = counts[startPos] > longestLength ? counts[startPos] : longestLength;
        // startPos 移动到重复字符的后面
        startPos = cmpPtr + 1;
        continue;
      } else {  // 没有重复字符
        // 计数++
        counts[cmpPtr] += 1;
      }
    }
    counts[curPos] = 1;
  }
  longestLength = counts[startPos] > longestLength ? counts[startPos] : longestLength;
  free(counts);
  return longestLength;
}

~~~

## better solution (19ms)

使用两个指针相继向右移动，如果区间内没有重复字符，则右指针++。如果有，则左指针++。通过维护一个区间内所有字符的集合来判定，接下来的字符是不是重复字符。每一步移动都计算下左右指针之间的字符串长度，统计最大值，并且相应地向集合加入或去掉元素。

# Source Code

## submission

~~~c
#include <stdio.h>

int lengthOfLongestSubstring(const char *str) {
  unsigned char set[256] = {};
  int length = 0;
  int startPos = 0;
  int endPos = 0;
  while (str[endPos]) {
    if (set[str[endPos]]) {
      set[str[startPos]] = 0;
      startPos += 1;
    } else {
      set[str[endPos]] = 1;
      endPos += 1;
      int curLen = endPos - startPos;
      length = curLen > length ? curLen : length;
    }
  }
  return length;
}

~~~

## framework

~~~c
/* ================== submission begins ===================== */

#include <stdio.h>

int lengthOfLongestSubstring(const char *str) {
  unsigned char set[256] = {};
  int length = 0;
  int startPos = 0;
  int endPos = 0;
  while (str[endPos]) {
    if (set[str[endPos]]) {
      set[str[startPos]] = 0;
      startPos += 1;
    } else {
      set[str[endPos]] = 1;
      endPos += 1;
      int curLen = endPos - startPos;
      length = curLen > length ? curLen : length;
    }
  }
  return length;
}

/* ================== submission ends ===================== */

int main() {
  char input[100] = {};
  scanf("%s", input);
  printf("ans: %d\n", lengthOfLongestSubstring(input));
}

~~~
