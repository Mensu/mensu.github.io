---
layout: post
title: "LeetCode: 32. Longest Valid Parentheses"
description: "最长合法括号对的长度"
subtitle: "week 9"
create-date: 2017-11-23
update-date: 2017-11-23
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Hard
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Longest Valid Parentheses - LeetCode](https://leetcode.com/problems/longest-valid-parentheses/description/){:target="_blank"}

Given a string containing just the characters ``'('`` and ``')'``, find the length of the longest valid (well-formed) parentheses substring.

For ``"(()"``, the longest valid parentheses substring is ``"()"``, which has length = 2.

Another example is ``")()())"``, where the longest valid parentheses substring is ``"()()"``, which has length = 4.

# Solution

## my naive solution (∞ ms)

too naive to figure out a solution...

## better solution (3 ms)

看了 Solution，其中提到可以通过扫描统计左右括号数目的方式

大概的原理是

1. 如果某个字符串 ``str`` 有 ``左括号数目 == 右括号数目``，而且它的所有前缀 ``str[0:i]`` 都有 ``左括号数目 >= 右括号数目``，且那么这个字符串是合法的括号对
2. 如果某个字符串 ``str`` 有 ``左括号数目 < 右括号数目``，那以 ``str`` 为前缀的字符串都不可能是合法的括号对

于是可以先左向右扫描一波，分别统计左右括号数目。起点初始化为字符串的开头。在扫描的过程中，为保证从起点到当前位置的字符串 ``左括号数目 >= 右括号数目``：

- 如果 ``左括号数目 < 右括号数目``，根据 **原理 2**，从起点到当前位置以及之后位置的字符串都不可能是合法的括号对了，于是需要设置新的起点（当前位置之后），重新统计 (1)
- 如果 ``左括号数目 == 右括号数目``，根据 **原理 1**，说明从起点到当前位置是合法的括号对，统计它的长度（左括号数目 × 2），看是不是最大值 (2)
- 如果 ``左括号数目 > 右括号数目``，继续统计 (3)

整个字符串扫描完毕

- 如果 ``左括号数目 == 右括号数目``，此时的最大值就是整个字符串的最长合法括号对的长度 (4)
- 如果 ``左括号数目 > 右括号数目``，则从起点到字符串末尾的某个子串可能是最长合法括号对，如 ``((())(()`` 的第 2 到第 5 个字符 ``(())`` (5)

对于第二种情况，可以将起点到字符串末尾的字符串反转，如 ``((())(()`` 反转为 ``())(()))``，再进行一次上述扫描。由于从起点到字符串末尾的字符串的每个前缀都有 ``左括号数目 >= 右括号数目``，所以反转后的每个后缀都有 ``左括号数目 <= 右括号数目``，也就是说反转字符串扫描完毕时，不会再出现 ``左括号数目 > 右括号数目`` 的情况，不用再考虑反转字符串的某个子串有没有可能是最长合法括号对

# Source Code

## submission

~~~c
int longestValidParentheses(const char *str) {
  int pos = 0;
  int maxHalfLen = 0;
  int leftParenCount = 0;
  int rightParenCount = 0;

  // 从左向右扫描
  while (str[pos]) {
    switch (str[pos]) {
      case '(':
        ++leftParenCount;
        // 因为保证了 leftParenCount >= rightParenCount
        // 所以肯定是 rightParenCount 追上 leftParenCount
        // 不必在 '(' 时判断 leftParenCount >= rightParenCount 需要采取的操作
        break;
      case ')':
        ++rightParenCount;
        // (1) 根据原理 2，重置起点
        // 起点可以用 pos - leftParenCount - rightParenCount 表示
        if (rightParenCount > leftParenCount) {
          leftParenCount = rightParenCount = 0;
        }
        // (2) 根据原理 1，相等时，考虑取最大值
        if (rightParenCount == leftParenCount && maxHalfLen < leftParenCount) {
          maxHalfLen = leftParenCount;
        }
        break;
      default:
        break;
    }
    ++pos;
  }

  // (4)
  if (leftParenCount == rightParenCount) {
    return maxHalfLen * 2;
  }

  // (5)
  int start = pos - leftParenCount - rightParenCount;
  leftParenCount = rightParenCount = 0;
  // 反转通过反向扫描实现相似效果
  while (pos >= start) {
    switch (str[pos - 1]) {
      case ')':
        ++leftParenCount;
        break;
      case '(':
        ++rightParenCount;
        if (rightParenCount > leftParenCount) {
          leftParenCount = rightParenCount = 0;
        }
        if (rightParenCount == leftParenCount && maxHalfLen < leftParenCount) {
          maxHalfLen = leftParenCount;
        }
        break;
      default:
        break;
    }
    --pos;
  }
  return maxHalfLen * 2;
}

~~~

## framework

~~~c
#include <stdio.h>

/* ================== submission begins ===================== */

int longestValidParentheses(const char *str) {
  int pos = 0;
  int maxHalfLen = 0;
  int leftParenCount = 0;
  int rightParenCount = 0;

  // 从左向右扫描
  while (str[pos]) {
    switch (str[pos]) {
      case '(':
        ++leftParenCount;
        // 因为保证了 leftParenCount >= rightParenCount
        // 所以肯定是 rightParenCount 追上 leftParenCount
        // 不必在 '(' 时判断 leftParenCount >= rightParenCount 需要采取的操作
        break;
      case ')':
        ++rightParenCount;
        // (1) 根据原理 2，重置起点
        // 起点可以用 pos - leftParenCount - rightParenCount 表示
        if (rightParenCount > leftParenCount) {
          leftParenCount = rightParenCount = 0;
        }
        // (2) 根据原理 1，相等时，考虑取最大值
        if (rightParenCount == leftParenCount && maxHalfLen < leftParenCount) {
          maxHalfLen = leftParenCount;
        }
        break;
      default:
        break;
    }
    ++pos;
  }

  // (4)
  if (leftParenCount == rightParenCount) {
    return maxHalfLen * 2;
  }

  // (5)
  int start = pos - leftParenCount - rightParenCount;
  leftParenCount = rightParenCount = 0;
  // 反转通过反向扫描实现相似效果
  while (pos >= start) {
    switch (str[pos - 1]) {
      case ')':
        ++leftParenCount;
        break;
      case '(':
        ++rightParenCount;
        if (rightParenCount > leftParenCount) {
          leftParenCount = rightParenCount = 0;
        }
        if (rightParenCount == leftParenCount && maxHalfLen < leftParenCount) {
          maxHalfLen = leftParenCount;
        }
        break;
      default:
        break;
    }
    --pos;
  }
  return maxHalfLen * 2;
}

/* ================== submission ends ===================== */

int main() {
  char str[100];
  scanf("%s", str);
  printf("%d\n", longestValidParentheses(str));
}

~~~
