---
layout: post
title: "LeetCode: 6. ZigZag Conversion"
description: "转换为拉链字符串"
subtitle: "week 4"
create-date: 2017-10-10
update-date: 2017-10-10
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [ZigZag Conversion - LeetCode](https://leetcode.com/problems/zigzag-conversion/description/){:target="_blank"}

The string ``"PAYPALISHIRING"`` is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)

~~~
P   A   H   N
A P L S I I G
Y   I   R
~~~

And then read line by line: ``"PAHNAPLSIIGYIR"``

Write the code that will take a string and make this conversion given a number of rows:

~~~cpp
string convert(string text, int nRows);
~~~

``convert("PAYPALISHIRING", 3)`` should return ``"PAHNAPLSIIGYIR"``.

# Solution

## my naive solution (19 ms)

可以通过找下标的变化规律来解决

以 ``5 ABCDEFGHIJKLMNOPQRS`` 为例

~~~
    0       1       2
0   A       I       Q
1   B     H J     P R
2   C   G   K   O   S
3   D F     L N
4   E       M
~~~

不妨设 $$ colGap $$ 为 4，表示 $$ col_0 $$ 到 $$ col_1 $$ 的距离为 $$ colGap $$ 个字符

显然，从上往下从左往右看，第 0 行有

``A`` 的下标为 $$ 0 \times 2 \times colGap = 0 $$

``I`` 的下标为 $$ 1 \times 2 \times colGap = 8 $$

``Q`` 的下标为 $$ 2 \times 2 \times colGap = 16 $$

第 1 行有

``B`` 的下标为 $$ 0 \times 2 \times colGap + 1 = 1 $$

``H`` 的下标为 $$ 1 \times 2 \times colGap - 1 = 7 $$

``J`` 的下标为 $$ 1 \times 2 \times colGap + 1 = 9 $$

``P`` 的下标为 $$ 2 \times 2 \times colGap - 1 = 15 $$

``R`` 的下标为 $$ 2 \times 2 \times colGap + 1 = 17 $$

于是，我们可以凭直觉得到一条下标公式

$$ col_i \times 2 \times colGap \pm row_i $$

通过一个两层循环，**从上往下从左往右**遍历 $$ row_i $$ 和 $$ col_i $$，用上述公式计算出候选下标 ``index``

- 如果计算出来的下标在输入字符串 ``src`` 的长度范围内，则将 ``src[index]`` 追加到结果字符串中
- 如果 ``index`` 超过 ``src`` 的长度范围，说明再往后的 $$ col_i $$ 都不会有字符了，可以结束当前 $$ col_i $$ 递增的循环，尝试下一行了

这样从上往下从左往右遍历一波即可得到所求的字符串。当然还要对临界情况进行一些特殊处理：

- **第 0 行**和**最后一行**只需要输出一次，即输出 $$ col_i \times 2 \times colGap + row_i $$
- **总行数为 1 时**，公式退化为 $$ col_i \times 1 + 0 = col_i $$

# Source Code

## submission

~~~c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

const size_t maxLen = 100000;

char *convert(const char *src, int numRows) {
  const int colGap = numRows - 1;
  const size_t len = strnlen(src, maxLen);
  char *dest = malloc((len + 1) * sizeof(char));
  if (len == 0) {
    dest[0] = '\0';
    return dest;
  }
  size_t srcIndex = 0;
  size_t destIndex = 0;
  for (size_t rowIndex = 0; rowIndex < numRows; ++rowIndex) {
    int notLastLine = rowIndex != colGap;
    size_t indexGap = colGap ? 2 * colGap : 1;
    for (size_t colIndex = 0; ; ++colIndex) {
      if (rowIndex && colIndex && notLastLine) {
        srcIndex = colIndex * indexGap - rowIndex;
        if (srcIndex < len) {
          dest[destIndex] = src[srcIndex];
          ++destIndex;
        } else {
          break;
        }
      }
      srcIndex = colIndex * indexGap + rowIndex;
      if (srcIndex < len) {
        dest[destIndex] = src[srcIndex];
        ++destIndex;
      } else {
        break;
      }
    }
  }
  dest[destIndex] = '\0';
  return dest;
}

~~~

## framework

~~~c
/* ================== submission begins ===================== */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

const size_t maxLen = 100000;

char *convert(const char *src, int numRows) {
  const int colGap = numRows - 1;
  const size_t len = strnlen(src, maxLen);
  char *dest = malloc((len + 1) * sizeof(char));
  if (len == 0) {
    dest[0] = '\0';
    return dest;
  }
  size_t srcIndex = 0;
  size_t destIndex = 0;
  for (size_t rowIndex = 0; rowIndex < numRows; ++rowIndex) {
    int notLastLine = rowIndex != colGap;
    size_t indexGap = colGap ? 2 * colGap : 1;
    for (size_t colIndex = 0; ; ++colIndex) {
      if (rowIndex && colIndex && notLastLine) {
        srcIndex = colIndex * indexGap - rowIndex;
        if (srcIndex < len) {
          dest[destIndex] = src[srcIndex];
          ++destIndex;
        } else {
          break;
        }
      }
      srcIndex = colIndex * indexGap + rowIndex;
      if (srcIndex < len) {
        dest[destIndex] = src[srcIndex];
        ++destIndex;
      } else {
        break;
      }
    }
  }
  dest[destIndex] = '\0';
  return dest;
}

/* ================== submission ends ===================== */

int main() {
  int numRows = 0;
  char input[1001] = {};
  scanf("%d %s", &numRows, input);
  printf("%s\n", convert(input, numRows));
}

~~~
