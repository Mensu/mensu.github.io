---
layout: post
title: "LeetCode: 8. String to Integer (atoi)"
description: "字符串转整数"
subtitle: "week 5"
create-date: 2017-10-11
update-date: 2017-10-11
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [String to Integer (atoi) - LeetCode](https://leetcode.com/problems/string-to-integer-atoi/description/){:target="_blank"}

Implement ``atoi`` to convert a string to an integer.

**Hint:** Carefully consider all possible input cases. If you want a challenge, please do not see below and ask yourself what are the possible input cases.

**Notes:** It is intended for this problem to be specified vaguely (ie, no given input specs). You are responsible to gather all the input requirements up front.

**Requirements for atoi:**

The function first discards as many whitespace characters as necessary until the first non-whitespace character is found. Then, starting from this character, takes an optional initial plus or minus sign followed by as many numerical digits as possible, and interprets them as a numerical value.

The string can contain additional characters after those that form the integral number, which are ignored and have no effect on the behavior of this function.

If the first sequence of non-whitespace characters in str is not a valid integral number, or if no such sequence exists because either str is empty or it contains only whitespace characters, no conversion is performed.

If no valid conversion could be performed, a zero value is returned. If the correct value is out of the range of representable values, INT_MAX (2147483647) or INT_MIN (-2147483648) is returned.

# Solution

## my naive solution (12 ms)

固定的套路应该是状态机之类的。不过这里只有两个主要的状态，就不搞得那么正式了。状态的转移可以通过**符号是否已确定**来判断

### 状态 1：确定符号前，遇到...

- 空白：跳过
- 加减号：确定加减号，进入状态 2
- 数字：确定加号，进入状态 2，处理当前数字
- 其他：结束，返回当前结果（0）

### 状态 2：确定符号后，遇到...

- 空白：结束，返回当前结果
- 加减号：结束，返回当前结果
- 数字：处理当前数字
- 其他：结束，返回当前结果

### 处理当前数字

核心的迭代公式是

$$ num = num \times 10 \pm digit $$

- 溢出检查
  + 分符号检查 ``num × 10`` 和 ``num × 10 ± digit`` 是否超过最值。可以通过比较 ``num`` 和 ``limit / 10`` 的大小关系来避免溢出
  + 如果溢出了，返回最值即可
- 应用迭代公式


# Source Code

## submission

~~~c
#include <stdio.h>
#include <ctype.h>
#include <limits.h>
#include <stdlib.h>

const int int_sub_max = INT_MAX / 10;
const int int_sub_max_remainder = INT_MAX % 10;
const int int_sub_min = INT_MIN / 10;
const int int_sub_min_remainder = -(INT_MIN % 10);

int myAtoi(const char *str) {
  size_t pos = 0;
  int result = 0;
  int sign = 0;
  int cur_digit = 0;
  for (char cur_char = str[pos]; cur_char; ++pos, cur_char = str[pos]) {
    if (sign == 0) {
      if (isspace(cur_char)) {
         continue;
      } else if (cur_char == '+') {
         sign = 1;
         continue;
      } else if (cur_char == '-') {
         sign = -1;
         continue;
      }
    }
    if (isdigit(cur_char)) {
      cur_digit = cur_char - '0';
      if (sign == -1) {
        if (result < int_sub_min || // (result * 10) will overflow
          // (result * 10 - cur_digit) will overflow
          (int_sub_min == result && cur_digit > int_sub_min_remainder)) {
          return INT_MIN;
        }
        result = result * 10 - cur_digit;
      } else if (result > int_sub_max ||  // (result * 10) will overflow
        // (result * 10 + cur_digit) will overflow
        (int_sub_max == result && cur_digit > int_sub_max_remainder)) {
        return INT_MAX;
      } else {
        sign = 1;
        result = result * 10 + cur_digit;
      }
      continue;
    } else {
      return result;
    }
  }
  return result;
}

~~~

## framework

~~~c
/* ================== submission begins ===================== */

#include <stdio.h>
#include <ctype.h>
#include <limits.h>
#include <stdlib.h>

const int int_sub_max = INT_MAX / 10;
const int int_sub_max_remainder = INT_MAX % 10;
const int int_sub_min = INT_MIN / 10;
const int int_sub_min_remainder = -(INT_MIN % 10);

int myAtoi(const char *str) {
  size_t pos = 0;
  int result = 0;
  int sign = 0;
  int cur_digit = 0;
  for (char cur_char = str[pos]; cur_char; ++pos, cur_char = str[pos]) {
    if (sign == 0) {
      if (isspace(cur_char)) {
         continue;
      } else if (cur_char == '+') {
         sign = 1;
         continue;
      } else if (cur_char == '-') {
         sign = -1;
         continue;
      }
    }
    if (isdigit(cur_char)) {
      cur_digit = cur_char - '0';
      if (sign == -1) {
        if (result < int_sub_min || // (result * 10) will overflow
          // (result * 10 - cur_digit) will overflow
          (int_sub_min == result && cur_digit > int_sub_min_remainder)) {
          return INT_MIN;
        }
        result = result * 10 - cur_digit;
      } else if (result > int_sub_max ||  // (result * 10) will overflow
        // (result * 10 + cur_digit) will overflow
        (int_sub_max == result && cur_digit > int_sub_max_remainder)) {
        return INT_MAX;
      } else {
        sign = 1;
        result = result * 10 + cur_digit;
      }
      continue;
    } else {
      return result;
    }
  }
  return result;
}

/* ================== submission ends ===================== */

int main() {
  char *input = NULL;
  size_t len = 0;
  getline(&input, &len, stdin);
  printf("%d\n", myAtoi(input));
  free(input);
}

~~~
