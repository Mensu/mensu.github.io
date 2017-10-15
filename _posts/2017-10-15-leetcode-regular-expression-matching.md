---
layout: post
title: "LeetCode: 10. Regular Expression Matching"
description: "实现带 '.' 和 '*' 的正则匹配"
subtitle: "week 6"
create-date: 2017-10-15
update-date: 2017-10-15
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Hard
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Regular Expression Matching - LeetCode](https://leetcode.com/problems/regular-expression-matching/description/){:target="_blank"}

Implement regular expression matching with support for '.' and '*'.

~~~
'.' Matches any single character.
'*' Matches zero or more of the preceding element.

The matching should cover the entire input string (not partial).

The function prototype should be:
bool isMatch(const char *s, const char *p)

Some examples:
isMatch("aa","a") → false
isMatch("aa","aa") → true
isMatch("aaa","aa") → false
isMatch("aa", "a*") → true
isMatch("aa", ".*") → true
isMatch("ab", ".*") → true
isMatch("aab", "c*a*b") → true
~~~

# Solution

## my naive solution (∞ ms)

too naive to figure out a solution...

## better solution (6 ms)

看了解析说可以动态规划，于是 copy 了解析的思路

### 大体框架

不妨设字符串为 ``str``，长度为 ``str_len``；正则表达式为 ``pattern``，由 ``p_len`` 个**结点**组成

结点形如：

- ``a``
- ``a*``
- ``.``
- ``.*``

我们可以建立一张表格 ``match_table``，用 ``match_table[i][j]`` 表示子字符串 ``str[0:i]`` 和子表达式 ``pattern[0:j]`` 是否匹配

然后按 ``i``、``j`` 从小到大的顺序，用两层循环遍历填充这张表格，填完以后的 ``match_table[str_len][p_len]`` 即为所求：``str`` 和 ``pattern`` 是否匹配

### 怎么填？

如果没有 ``*``，事情就简单多了，例如判断子字符串 ``abc`` 和正则表达式 ``ab.`` 是否匹配：

- 当前字符是 ``c``，当前结点是 ``.``
- 若，``c`` 和 ``.`` 匹配，且之前的部分 ``[ab]c`` 和 ``[ab].`` 也匹配（查表可得），则可以判定 ``abc`` 和 ``ab.`` 匹配 (1)
- 否则不匹配

有了 ``*`` 之后，就得考虑 ``*`` 带来的影响了。当 ``*`` 表示 **1 次** 时，例如判断 ``abc`` 和 ``abc*`` 是否匹配，套一下上面的逻辑：

- 当前字符是 ``c``，当前结点是 ``c*``
- 若，``c`` 和 ``c`` 匹配，且之前的部分 ``[ab]c`` 和 ``[ab]c*`` 也匹配（查表可得），则可以判定 ``abc`` 和 ``abc*`` 匹配

似乎没有毛病，可以复用。再考虑 ``*`` 表示 **0 次** 的用法。例如判断 ``ab`` 和 ``abc*`` 是否匹配：

- 当前字符是 ``b``，当前结点是 ``c*``
- ``b`` 和 ``c`` 不匹配
- 但去掉当前结点后，``[ab]`` 和 ``[ab]c*`` 相匹配（查表可得），也可以推出 ``ab`` 和 ``abc*`` 是匹配的（而且与 ``b`` 和 ``c`` 是否匹配无关）(2)

还要考虑到 ``*`` 表示 **多次** 的用法。例如判断 ``abcc`` 和 ``abc*`` 是否匹配：

- 当前字符是 ``c``，当前结点是 ``c*``
- ``c`` 和 ``c`` 匹配，之前的部分 ``[abc]c`` 和 ``[ab]c*`` 不匹配
- 但去掉当前字符后，``[abc]c`` 和 ``[abc*]`` 相匹配（查表可得），加上``c`` 和 ``c`` 匹配，也可以推出 ``abcc`` 和 ``abc*`` 是匹配的 (3)

结合上述 (1)、(2)、(3)，我们可以得到下面的填法：

~~~c
// match_table[str_pos][p_pos] 表示 str[0:str_pos] 和 pattern[0:p_pos] 是否匹配
bool cur_pos_match = cur_char == '.' || cur_char == cur_node.character
if (cur_pos_match && match_table[i - 1][j - 1]) {  // (1)
  result = true;
} else if (cur_node.stared) {  // (2), (3)
  if (match_table[i][j - 1]) {  // (2)
    result = true;
  } else if (cur_pos_match && match_table[i - 1][j]) {  // (3)
    result = true;
  } else {  // failed to match with *
    result = false;
  }
} else {  // failed to match without *
  result = false;
}
match_table[i][j] = result;
~~~

### 初始化

题目给的正则表达式是野生的字符串，所以要加工一下，变成结点数组

然后 ``match_table`` 应该如何初始化。``match_table[1][1]`` 到 ``match_table[str_len][p_len]`` 是我们待会儿要填的，所以没有初始化也没关系。但 ``match_table[0][0]`` 到 ``match_table[0][p_len]`` 和 ``match_table[str_len][0]`` 可不能没有初始化，毕竟他们是表格其他部分填写的基础

首先考虑**非空字符串**和**空正则**，也就是 ``match_table[str_pos][0]``。他们可能被这么使用：字符串 ``ba`` 和 正则 ``a`` 是否匹配。当前字符和当前结点是匹配的，但 ``[b]a`` 和 ``[]a`` 要是匹配的话，就会得到 ``ba`` 和 ``a`` 匹配的错误结论。所以 ``match_table[str_pos][0]`` 应当初始化为 ``false``

接下来考虑**空字符串**和**非空正则**，也就是 ``match_table[0][p_pos]``。他们可能被这么使用：字符串 ``a`` 和正则 ``ba`` 是否匹配。当前字符和当前结点是匹配的，但 ``[]a`` 和 ``[b]a`` 要是匹配的话，就会得到 ``a`` 和 ``ba`` 匹配的错误结论。所以当非空正则不都是 ``*`` 时，``match_table[0][p_pos]`` 应当初始化为 ``false``

再考虑字符串 ``a`` 和正则 ``b*c*a`` 是否匹配。当前字符和当前结点是匹配的，但 ``[]a`` 和 ``[b*c*]a`` 要是不匹配的话，就会得到 ``a`` 和 ``b*c*a`` 不匹配的错误结论。所以，所以当非空正则都是 ``*`` 结点时，``match_table[0][p_pos]`` 应当初始化为 ``true``

也就是说，在初始化 ``match_table[0][p_pos]`` 时，要看 ``pattern[0:p_pos]`` 是不是都是 ``*`` 结点

最后考虑**空字符串**和**空正则**，也就是 ``match_table[0][0]``。考虑字符串 ``a`` 和正则 ``a`` 是否匹配。当前字符和当前结点是匹配的，但 ``[]a`` 和 ``[]a`` 要是不匹配的话，就会得到 ``a`` 和 ``a`` 不匹配的错误结论。所以 ``match_table[0][0]`` 应该为 ``true``

### 空间优化

观察整个表格的使用过程，不难发现，其实只需要用到 ``match_table[i - 1][x]`` 和 ``match_table[i][x]`` 这两行。于是整个表格在实现时，可以压缩成两行：表示 ``match_table[i - 1]`` 的 ``prev_table``，以及表示 ``match_table[i]`` 的 ``cur_table``，只要不停地交替使用就好了，没必要傻傻地物质化一个大表格出来

# Source Code

## submission

~~~c
#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

const int max_len = 1000000;

typedef struct {
  char character;
  bool stared;
} Node;

typedef Node *NodePtr;
typedef bool *MatchTable;

NodePtr get_pattern(const char *src, size_t *pattern_len_ptr) {
  size_t len = strnlen(src, max_len);
  NodePtr pattern = malloc(sizeof(Node) * len);
  size_t src_pos = 0;
  size_t pattern_pos = -1;
  for (char cur_char = src[src_pos]; cur_char; ++src_pos, cur_char = src[src_pos]) {
    if (cur_char == '*') {
      pattern[pattern_pos].stared = true;
      continue;
    }
    ++pattern_pos;
    pattern[pattern_pos].character = cur_char;
    pattern[pattern_pos].stared = false;
  }
  *pattern_len_ptr = pattern_pos + 1;
  return pattern;
}

bool isMatch(const char *str, const char *p) {
  if (p[0] == '\0') {
    return str[0] == '\0';
  }

  size_t p_len = 0;
  NodePtr pattern = get_pattern(p, &p_len);

  MatchTable tmp = 0;
  MatchTable cur_table = malloc(sizeof(bool) * (p_len + 1));
  MatchTable prev_table = malloc(sizeof(bool) * (p_len + 1));

  bool is_prefix_star = true;
  for (size_t index = 0; index <= p_len; ++index) {
    prev_table[index] = is_prefix_star;
    if (!pattern[index].stared) {
      is_prefix_star = false;
    }
  }

  size_t str_pos = 1;
  size_t p_pos = 1;
  char cur_node_char = 0;
  bool cur_pos_match = false;
  for (char cur_char = str[str_pos - 1]; cur_char; ++str_pos, cur_char = str[str_pos - 1]) {
    cur_table[0] = false;
    p_pos = 1;
    for (NodePtr cur_node = &pattern[p_pos - 1]; p_pos <= p_len; ++p_pos, cur_node = &pattern[p_pos - 1]) {
      cur_node_char = cur_node->character;
      cur_pos_match = cur_node_char == '.' || cur_node_char == cur_char;
      if (cur_pos_match && prev_table[p_pos - 1]) {
        cur_table[p_pos] = true;
      } else if (cur_node->stared) {
        //                     * => 0               * => prev + 1
        cur_table[p_pos] = cur_table[p_pos - 1] || (cur_pos_match && prev_table[p_pos]);
      } else {
        cur_table[p_pos] = false;
      }
    }
    tmp = cur_table;
    cur_table = prev_table;
    prev_table = tmp;
  }
  bool result = prev_table[p_len];
  free(pattern);
  free(cur_table);
  free(prev_table);
  return result;
}

~~~

## framework

~~~c
/* ================== submission begins ===================== */

#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

const int max_len = 1000000;

typedef struct {
  char character;
  bool stared;
} Node;

typedef Node *NodePtr;
typedef bool *MatchTable;

NodePtr get_pattern(const char *src, size_t *pattern_len_ptr) {
  size_t len = strnlen(src, max_len);
  NodePtr pattern = malloc(sizeof(Node) * len);
  size_t src_pos = 0;
  size_t pattern_pos = -1;
  for (char cur_char = src[src_pos]; cur_char; ++src_pos, cur_char = src[src_pos]) {
    if (cur_char == '*') {
      pattern[pattern_pos].stared = true;
      continue;
    }
    ++pattern_pos;
    pattern[pattern_pos].character = cur_char;
    pattern[pattern_pos].stared = false;
  }
  *pattern_len_ptr = pattern_pos + 1;
  return pattern;
}

bool isMatch(const char *str, const char *p) {
  if (p[0] == '\0') {
    return str[0] == '\0';
  }

  size_t p_len = 0;
  NodePtr pattern = get_pattern(p, &p_len);

  MatchTable tmp = 0;
  MatchTable cur_table = malloc(sizeof(bool) * (p_len + 1));
  MatchTable prev_table = malloc(sizeof(bool) * (p_len + 1));

  bool is_prefix_star = true;
  for (size_t index = 0; index <= p_len; ++index) {
    prev_table[index] = is_prefix_star;
    if (!pattern[index].stared) {
      is_prefix_star = false;
    }
  }

  size_t str_pos = 1;
  size_t p_pos = 1;
  char cur_node_char = 0;
  bool cur_pos_match = false;
  for (char cur_char = str[str_pos - 1]; cur_char; ++str_pos, cur_char = str[str_pos - 1]) {
    cur_table[0] = false;
    p_pos = 1;
    for (NodePtr cur_node = &pattern[p_pos - 1]; p_pos <= p_len; ++p_pos, cur_node = &pattern[p_pos - 1]) {
      cur_node_char = cur_node->character;
      cur_pos_match = cur_node_char == '.' || cur_node_char == cur_char;
      if (cur_pos_match && prev_table[p_pos - 1]) {
        cur_table[p_pos] = true;
      } else if (cur_node->stared) {
        //                     * => 0               * => prev + 1
        cur_table[p_pos] = cur_table[p_pos - 1] || (cur_pos_match && prev_table[p_pos]);
      } else {
        cur_table[p_pos] = false;
      }
    }
    tmp = cur_table;
    cur_table = prev_table;
    prev_table = tmp;
  }
  bool result = prev_table[p_len];
  free(pattern);
  free(cur_table);
  free(prev_table);
  return result;
}

/* ================== submission ends ===================== */

int main() {
  char str[100] = {};
  char pattern[100] = {};
  scanf("%s %s", str, pattern);
  printf("%d\n", isMatch(str, pattern));
}

~~~
