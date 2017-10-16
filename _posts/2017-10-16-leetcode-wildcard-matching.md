---
layout: post
title: "LeetCode: 44. Wildcard Matching"
description: "实现带 '?' 和 '*' 的通配"
subtitle: "week 7"
create-date: 2017-10-16
update-date: 2017-10-16
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Hard
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Wildcard Matching - LeetCode](https://leetcode.com/problems/wildcard-matching/description/){:target="_blank"}

Implement wildcard pattern matching with support for ``'?'`` and ``'*'``.

~~~
'?' Matches any single character.
'*' Matches any sequence of characters (including the empty sequence).

The matching should cover the entire input string (not partial).

The function prototype should be:
bool isMatch(const char *s, const char *p)

Some examples:
isMatch("aa","a") → false
isMatch("aa","aa") → true
isMatch("aaa","aa") → false
isMatch("aa", "*") → true
isMatch("aa", "a*") → true
isMatch("ab", "?*") → true
isMatch("aab", "c*a*b") → false
~~~

# Solution

## my naive solution (42 ms)

翻译成 [Regular Expression Matching](https://mensu.github.io/2017/10/15/leetcode-regular-expression-matching){:target="_blank"}

在生成结点数组时处理一下即可

- ``?`` -> ``.``
- ``*`` -> ``.*``

```c
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
  size_t pattern_pos = 0;
  for (char cur_char = src[src_pos]; cur_char; ++src_pos, ++pattern_pos, cur_char = src[src_pos]) {
    if (cur_char == '*') {
      pattern[pattern_pos].character = '?';
      pattern[pattern_pos].stared = true;
    } else {
      pattern[pattern_pos].character = cur_char;
      pattern[pattern_pos].stared = false;   
    }
  }
  *pattern_len_ptr = pattern_pos;
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
      cur_pos_match = cur_node_char == '?' || cur_node_char == cur_char;
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

```

## better solution (22 ms)

看了讨论说可以通过两个指针移动进行匹配，于是 copy 了讨论的思路

### 指针移动

还是先考虑没有 ``*`` 的情况。如果两个指针 ``str_pos`` 和 ``p_pos`` 指向的字符匹配，则分别向后移动；否则，得到结果：整个字符串都不匹配

~~~
abd  a?c   ->   abd  a?c   ->   abd  a?c
^    ^         ->^  ->^         ->^  ->^
~~~

再考虑有 ``*`` 的情况。如果 ``*`` 表示 **0 个** 字符，此时遇到 ``*`` 要跳过。如果接下来的部分匹配，则整个字符串匹配，否则整个字符串不匹配

~~~
ad  a*d   ->   ad  a*d
 ^   ^   跳过*   ^  ->^
~~~

如果 ``*`` 表示 **多个** 字符，跳过 ``*`` 后，如果接下来的部分匹配，当然整个字符串匹配。如果接下来的部分不匹配 (1)，直觉告诉我们，要尝试不停地把 ``str_pos`` 右移，直到两个指针又能匹配。从遇到 ``*`` 开始 ``str_pos`` 扫过的位置即 ``*`` 匹配到的字符串

~~~
abd  a*d   ->   abd  a*d   ->   abd  a*d
 ^    ^   跳过*   ^   ->^        ->^    ^  (左边的 str_pos 扫过的 b 可能是 * 匹配到的字符串)
~~~

两个指针又能匹配了，相继右移。可之后要是遇到两个指针再次不匹配，可不能直接判定为整个字符串不匹配。毕竟也有可能从遇到 ``*`` 开始 ``str_pos`` 扫过的位置**都是** ``*`` 匹配到的字符串

~~~
abdededf  a*dedf   ->   abdededf  a*dedf
  ^         ^              ->^       ->^   (左边的 str_pos 扫过的 dede 可能都是 * 匹配到的字符串)
~~~

容易忽略也有可能是，从遇到 ``*`` 开始 ``str_pos`` 扫过的位置**的前缀是** ``*`` 匹配到的字符串，如上例中的 ``de``（正解）

这个时候就要回到上面的状态 (1)，重新开始了。也就是把右边的 ``p_pos`` 回滚到 * 后面的位置

~~~
abdededf  a*dedf   ->   abdededf  a*dedf
     ^         ^             ^      ^<-
~~~

如果我们认为【从遇到 ``*`` 开始 ``str_pos`` 扫过的位置**都是** ``*`` 匹配到的字符串】，即认为上图中 ``dede`` 是 ``*`` 匹配到的字符串，则应该像下图一样，从 ``dede`` 之后的位置开始向后匹配

~~~
abdededf  a*dedf   ->   abdededf  a*dedf
     ^      ^               ->^     ^
~~~

如果我们认为【从遇到 ``*`` 开始 ``str_pos`` 扫过的位置中**的前缀是** ``*`` 匹配到的字符串】，即认为上图中 ``de`` 是 ``*`` 匹配到的字符串（正解），则应该像下图一样，退到 ``de`` 之后的位置，开始向后匹配

~~~
abdededf  a*dedf   ->   abdededf  a*dedf
     ^      ^               ^<-     ^
~~~

然而，要如何从这个过程中知道，匹配到的其实是 ``dede`` 中的 ``de``，着实触及到了我的知识盲区。所以，不妨暴力一点，直接后退到遇到 ``*`` 附近，保证 ``de`` 或 ``dede`` 都有机会被尝试。当然，后退到遇到 ``*`` 的位置，就重蹈覆辙了。所以要退到的应该是 遇到 ``*`` 的位置往后还没尝试过的位置

~~~
abdededf  a*dedf   ->   abdededf  a*dedf
     ^      ^              ^<-      ^
~~~

也就是说，**不仅要记下通配式中 ``*`` 的位置，还要记下遇到 ``*`` 的位置往后还没尝试过的位置**

总结一下，就是

```c
if (cur_p == '*') {  // 遇到 *
  // 记下 * 的位置
  p_star_pos = p_pos;
  str_star_pos = str_pos;
  // 跳过 *
  ++p_pos;
} else if (cur_p == '?' || cur_char == cur_p) {  // 匹配
  // 分别向后移动
  ++str_pos;
  ++p_pos;
} else if (p_star_pos != -1) {  // 不匹配，前面有 * -> 考虑回退
  // p_pos 回退
  p_pos = p_star_pos + 1;
  // 当前的 str_star_pos 无法匹配，尝试下一个 str_star_pos
  ++str_star_pos;
  str_pos = str_star_pos;
} else {  // 不匹配，前面没 * -> 整个字符串都不匹配
  return false;
}
```

### 边界情况

如果 ``p_pos`` 先到达通配式末尾，考察两种情况

- ``ab[c]`` 和 ``ab[]``
- ``ab[c]`` 和 ``ab*[]``

利用 C 语言字符串的特点，认为通配式还有一个末尾的 ``\0`` 可以参与比较，发现上述指针移动的过程仍然适用。所以不需要对 ``p_pos`` 先到达通配式末尾做额外的处理

相反，如果 ``str_pos`` 先到达字符串末尾，考察两种情况

- ``ab[]`` 和 ``ab[c]``
- ``ab[]`` 和 ``ab[*]``

不难发现，如果通配式剩下的部分都是 ``*`` 的话，后面的部分才算匹配

如果 ``str_pos`` 和 ``p_pos`` 同时到达了字符串末尾，说明前面都匹配，也就是整个字符串都匹配

# Source Code

## submission

~~~c
#include <stdio.h>
#include <stdbool.h>

bool isMatch(const char *str, const char *p) {
  size_t str_pos = 0;
  size_t p_pos = 0;
  size_t p_star_pos = -1;
  size_t str_star_pos = -1;
  char cur_char = str[str_pos];
  char cur_p = p[p_pos];
  while (cur_char) {
    if (cur_p == '*') {
      p_star_pos = p_pos;
      str_star_pos = str_pos;
      ++p_pos;
      cur_p = p[p_pos];
    } else if (cur_p == '?' || cur_char == cur_p) {
      ++p_pos;
      cur_p = p[p_pos];
      ++str_pos;
      cur_char = str[str_pos];
    } else if (p_star_pos != -1) {
      p_pos = p_star_pos + 1;
      cur_p = p[p_pos];
      ++str_star_pos;
      str_pos = str_star_pos;
      cur_char = str[str_pos];
    } else {
      return false;
    }
  }
  while (p[p_pos] == '*') {
    ++p_pos;
  }
  return p[p_pos] == '\0';
}

~~~

## framework

~~~c
/* ================== submission begins ===================== */

#include <stdio.h>
#include <stdbool.h>

bool isMatch(const char *str, const char *p) {
  size_t str_pos = 0;
  size_t p_pos = 0;
  size_t p_star_pos = -1;
  size_t str_star_pos = -1;
  char cur_char = str[str_pos];
  char cur_p = p[p_pos];
  while (cur_char) {
    if (cur_p == '*') {
      p_star_pos = p_pos;
      str_star_pos = str_pos;
      ++p_pos;
      cur_p = p[p_pos];
    } else if (cur_p == '?' || cur_char == cur_p) {
      ++p_pos;
      cur_p = p[p_pos];
      ++str_pos;
      cur_char = str[str_pos];
    } else if (p_star_pos != -1) {
      p_pos = p_star_pos + 1;
      cur_p = p[p_pos];
      ++str_star_pos;
      str_pos = str_star_pos;
      cur_char = str[str_pos];
    } else {
      return false;
    }
  }
  while (p[p_pos] == '*') {
    ++p_pos;
  }
  return p[p_pos] == '\0';
}

/* ================== submission ends ===================== */

int main() {
  char str[100] = {};
  char pattern[100] = {};
  scanf("%s %s", str, pattern);
  printf("%d\n", isMatch(str, pattern));
}

~~~
