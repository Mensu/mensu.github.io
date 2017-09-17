---
layout: post
title: "LeetCode: 3. Longest Substring Without Repeating Characters"
description: "链表数加法"
subtitle: ""
create-date: 2017-09-17
update-date: 2017-09-17
header-img: ""
author: "Mensu"
tags:
    - LeetCode
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

## my naive solution

大概就是维护一个数组，每个字符对应数组里的每个数 ``n``，表示从该字符开始长度为 ``n`` 的子字符串不包含重复的字符。

以 ``abcbb`` 为例，假如当前字符 ``str[curPos]`` 是 ``c``，即 ``curPos == 2``

从开始位 ``startPos == 0`` 开始查找 ``[startPos, curPos)`` 之间的每个字符 ``str[cmpPtr]`` 是否是当前字符 ``c``

不是的话，则将 ``cmpPtr`` 对应的数组数字 ``n`` + 1，表示期待从 ``cmpPtr`` 开始长为 ``n`` 的子串不包含重复字符，如 (1) (2) 所示。最后 ``curPos`` 对应的数组的数字也 + 1，如 (3) 所示

<style>
table td, th {
  border: 1px solid black;
  padding: 10px;
}
</style>

| # | a | b | c | b | b |
|:-:|:-:|:-:|:-:|:-:|:-:|
|(1)| 1 | 0 | 0 | 0 | 0 |
|(2)| 2 | 1 | 0 | 0 | 0 |
|(3)| 3 | 2 | 1 | 0 | 0 |

``str[cmpPtr]`` 是是当前字符 ``c`` 的话，则要将开始位 ``startPos`` 对应的数组的数 - 1，这个数便是从 ``startPos`` 到 ``curPos - 1`` 之间的长度，如刚才的例子，当前字符是 ``c`` 后面的 ``b``，扫到 ``c`` 前面的 ``b`` 时，发现 ``str[cmpPtr]`` 是当前字符 ``b``。于是计算 ``4 - 1 = 3``，表示从 ``a`` 到 ``b`` 的前一位 ``c`` 的子串长度 (5)。这个长度可能就是不重复子串的最大值，比较并储存。然后将开始位置于 ``b`` 后面的 ``c``，继续扫描 (6) (7)

| # | a | b | c | b | b |
|:-:|:-:|:-:|:-:|:-:|:-:|
|(3)| 3 | 2 | 1 | 0 | 0 |
|(4)| 4 | 2 | 1 | 0 | 0 |
|(5)| 3 | 2 | 1 | 0 | 0 |
|(6)| 3 | 2 | 2 | 0 | 0 |
|(7)| 3 | 2 | 2 | 1 | 0 |

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
    for (size_t cmpPtr = startPos; cmpPtr < curPos; ++cmpPtr) {
      if (str[cmpPtr] == curChar) {
        if (startPos < cmpPtr) {
          counts[startPos] -= 1;
        }
        longestLength = counts[startPos] > longestLength ? counts[startPos] : longestLength;
        startPos = cmpPtr + 1;
        continue;
      } else {
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

## better solution

使用两个指针不同步地向右移动，如果区间内没有重复字符，则右指针++。否则如果有，则左指针++。重复字符的判定使用数组当集合。每一步移动都计算下左右指针之间的字符串长度，取最大值。

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
