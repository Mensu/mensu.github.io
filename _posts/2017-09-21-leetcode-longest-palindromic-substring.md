---
layout: post
title: "LeetCode: 5. Longest Palindromic Substring"
description: "最长回文子串"
subtitle: "week 3"
create-date: 2017-09-21
update-date: 2017-09-21
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Longest Palindromic Substring - LeetCode](https://leetcode.com/problems/longest-palindromic-substring/description/){:target="_blank"}

Given a string **s**, find the longest palindromic substring in **s**. You may assume that the maximum length of **s** is 1000.

**Example:**

~~~
Input: "babad"

Output: "bab"

Note: "aba" is also a valid answer.
~~~

**Example:**

~~~
Input: "cbbd"

Output: "bb"
~~~

# Solution

## my naive solution (92 ms)

使用双重循环穷举可能的子串，再用一个循环确定是否是回文数。使用两个变量记录最长回文子串的起止位置。

其中可以通过实际的条件和要求提高搜索效率。例如，双重循环中，内层循环子串的结束位置 ``end`` 不一定要从起始位置 ``start`` 开始遍历。考虑到要求的是最长回文子串，内层循环子串的结束位置 ``end`` 可以从子串的起始位置 ``start + 当前最长子串长度`` 的位置开始，从而跳过一些检不检查都无所谓的子串。

~~~c
#include <stdio.h>
#include <string.h>

#define MAXLENGTH 1000

char *longestPalindrome(char *s) {
  int maxStart = 0;
  int maxEnd = 0;
  if (s[1] == 0) return s;
  size_t length = strnlen(s, MAXLENGTH);
  for (int start = 0; start < length; ++start) {
    // 跳过一些检不检查都无所谓的子串
    for (int end = start + maxEnd - maxStart + 1; end < length; ++end) {
      // 检查回文
      int breaked = 0;
      for (int left = start, right = end; left < right; ++left, --right) {
        if (s[left] == s[right]) continue;
        breaked = 1;
        break;
      }
      if (breaked) continue;
      int curLen = end - start + 1;
      if (curLen > maxEnd - maxStart + 1) {
        maxStart = start;
        maxEnd = end;
      }
    }
  }
  s[maxEnd + 1] = '\0';
  s += maxStart;
  return s;
}

~~~

## better solution (9ms)

观察到：当 ``aba`` 是回文字符串时，若 ``x == y``，则 ``xabay`` 也是回文字符串。

于是可以遍历所有的位置，对每个位置都尝试向两边扩张，得到尽可能长的回文字符串。

同样，可以通过 ``当前最长子串长度`` 提高效率。扩张时，直接从 ``当前最长子串长度`` 的一半开始扩张，从而跳过一些检不检查都无所谓的子串。

~~~
当前最长子串的长度为 5 的话 -> 5 / 2 - 1 = 1，从 offset 为 1 开始扩张

cdab(aba)badd
      |

从括号两端开始尝试扩张
cdab(aba)badd
   ^  |  ^
cdab(aba)badd
  ^   |   ^
cdab(aba)badd
 ^    |    ^

若成功扩张出去，再检查里面是不是回文子串
cdab(aba)badd
     ^|^

最终得到
c[dab(aba)bad]d -> dabababad

~~~

# Source Code

## submission

~~~c
#include <stdio.h>
#include <string.h>

#define MAXLENGTH 1000
#define len(slice) (slice.end - slice.start + 1)

typedef struct Slice {
  int start;
  int end;
} Slice;

Slice getMaxSlice(char *s, size_t length, int start, int end, int maxLen) {
  Slice ret = {0, 0};
  int offset = maxLen / 2 - 1;
  if (offset <= 0) {
    // 直接从点开始扩张
    while (start - 1 >= 0 && end + 1 < length) {
      if (s[start - 1] != s[end + 1]) break;
      --start, ++end;
    }
    Slice ret = {start, end};
    return ret;
  }
  // 从 当前最长子串长度 / 2 开始扩张
  int expandedStart = start - offset;
  int expandedEnd = end + offset;
  int expandTimes = 0;
  while (expandedStart - 1 >= 0 && expandedEnd + 1 < length) {
    if (s[expandedStart - 1] != s[expandedEnd + 1]) break;
    ++expandTimes;
    --expandedStart, ++expandedEnd;
  }
  // 若得以扩张，再回来检查直接从点开始扩张的情况
  if (expandTimes) {
    expandTimes = 0;
    while (start - 1 >= 0 && end + 1 < length) {
      if (s[start - 1] != s[end + 1]) break;
      ++expandTimes;
      --start, ++end;
      if (expandTimes == offset) {
        Slice ret = {expandedStart, expandedEnd};
        return ret;
      }
    }
  }
  // 不是回文子串
  return ret;
}

char *longestPalindrome(char *s) {
  Slice maxSlice = {0, 0};
  if (s[1] == 0) return s;
  size_t length = strnlen(s, MAXLENGTH);
  for (int i = 0; i < length; ++i) {
    Slice curSlice = getMaxSlice(s, length, i, i, len(maxSlice));
    if (len(maxSlice) < len(curSlice)) {
      maxSlice = curSlice;
    }
    if (i + 1 < length && s[i] == s[i + 1]) {
      curSlice = getMaxSlice(s, length, i, i + 1, len(maxSlice));
      if (len(maxSlice) < len(curSlice)) {
        maxSlice = curSlice;
      }
    }
  }
  s[maxSlice.end + 1] = '\0';
  s += maxSlice.start;
  return s;
}

~~~

## framework

~~~c
/* ================== submission begins ===================== */

#include <stdio.h>
#include <string.h>

#define MAXLENGTH 1000
#define len(slice) (slice.end - slice.start + 1)

typedef struct Slice {
  int start;
  int end;
} Slice;

Slice getMaxSlice(char *s, size_t length, int start, int end, int maxLen) {
  Slice ret = {0, 0};
  int offset = maxLen / 2 - 1;
  if (offset <= 0) {
    // 直接从点开始扩张
    while (start - 1 >= 0 && end + 1 < length) {
      if (s[start - 1] != s[end + 1]) break;
      --start, ++end;
    }
    Slice ret = {start, end};
    return ret;
  }
  // 从 当前最长子串长度 / 2 开始扩张
  int expandedStart = start - offset;
  int expandedEnd = end + offset;
  int expandTimes = 0;
  while (expandedStart - 1 >= 0 && expandedEnd + 1 < length) {
    if (s[expandedStart - 1] != s[expandedEnd + 1]) break;
    ++expandTimes;
    --expandedStart, ++expandedEnd;
  }
  // 若得以扩张，再回来检查直接从点开始扩张的情况
  if (expandTimes) {
    expandTimes = 0;
    while (start - 1 >= 0 && end + 1 < length) {
      if (s[start - 1] != s[end + 1]) break;
      ++expandTimes;
      --start, ++end;
      if (expandTimes == offset) {
        Slice ret = {expandedStart, expandedEnd};
        return ret;
      }
    }
  }
  // 不是回文子串
  return ret;
}

char *longestPalindrome(char *s) {
  Slice maxSlice = {0, 0};
  if (s[1] == 0) return s;
  size_t length = strnlen(s, MAXLENGTH);
  for (int i = 0; i < length; ++i) {
    Slice curSlice = getMaxSlice(s, length, i, i, len(maxSlice));
    if (len(maxSlice) < len(curSlice)) {
      maxSlice = curSlice;
    }
    if (i + 1 < length && s[i] == s[i + 1]) {
      curSlice = getMaxSlice(s, length, i, i + 1, len(maxSlice));
      if (len(maxSlice) < len(curSlice)) {
        maxSlice = curSlice;
      }
    }
  }
  s[maxSlice.end + 1] = '\0';
  s += maxSlice.start;
  return s;
}

/* ================== submission ends ===================== */

int main() {
  char str[1001] = {};
  scanf("%s", str);
  printf("%s\n", longestPalindrome(str));
}

~~~
