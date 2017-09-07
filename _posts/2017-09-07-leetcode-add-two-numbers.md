---
layout: post
title: "LeetCode: 2. Add Two Numbers"
description: "链表数加法"
subtitle: ""
create-date: 2017-09-07
update-date: 2017-09-07
header-img: ""
author: "Mensu"
tags:
    - LeetCode
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Add Two Numbers - LeetCode](https://leetcode.com/problems/add-two-numbers/description/){:target="_blank"}

You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in reverse order and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**Input:** `` (2 -> 4 -> 3) + (5 -> 6 -> 4) ``
**Output:** `` 7 -> 0 -> 8 ``


# 简要解答

按照加法的计算规则，从头开始同步遍历两个输入链表，结点和进位相加形成输出的链表结点，直到其中一个链表到了尽头。

接下来继续遍历另一个链表，和进位相加形成输出的链表结点。

链表都迭代完毕时，考虑进位。如果存在进位，则还需要再加一个输出节点。

# 源代码

## 提交
```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct ListNode ListNode;
typedef ListNode *ListNodePtr;

ListNodePtr createNode(int val1, int val2, int *carryPtr) {
  int sum = val1 + val2 + *carryPtr;
  *carryPtr = sum / 10;
  ListNodePtr newNode = calloc(sizeof(ListNode), 1);
  newNode->val = sum % 10;
  return newNode;
}

ListNodePtr addTwoNumbers(ListNodePtr l1, ListNodePtr l2) {
  ListNodePtr head = NULL;
  ListNodePtr prevNode = NULL;
  int carry = 0;
  // both have digits
  while (l1 != NULL && l2 != NULL) {
    ListNodePtr newNode = createNode(l1->val, l2->val, &carry);
    if (prevNode) {
      prevNode->next = newNode;
    } else {
      head = newNode;
    }
    prevNode = newNode;
    l1 = l1->next;
    l2 = l2->next;
  }

  // l2 is empty
  while (l1 != NULL) {
    prevNode = prevNode->next = createNode(l1->val, 0, &carry);
    l1 = l1->next;
  }

  // l1 is empty
  while (l2 != NULL) {
    prevNode = prevNode->next = createNode(0, l2->val, &carry);
    l2 = l2->next;
  }

  if (carry) {
    prevNode = prevNode->next = createNode(0, 0, &overflow);
  }

  return head;
}

```

## 测试框架

```c
struct ListNode {
  int val;
  struct ListNode *next;
};

/* ================== submission begins ===================== */

/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */

#include <stdio.h>
#include <stdlib.h>

typedef struct ListNode ListNode;
typedef ListNode *ListNodePtr;

ListNodePtr createNode(int val1, int val2, int *overflowPtr) {
  int sum = val1 + val2 + *overflowPtr;
  *overflowPtr = sum / 10;
  ListNodePtr newNode = calloc(sizeof(ListNode), 1);
  newNode->val = sum % 10;
  return newNode;
}

ListNodePtr addTwoNumbers(ListNodePtr l1, ListNodePtr l2) {
  ListNodePtr head = NULL;
  ListNodePtr prevNode = NULL;
  int overflow = 0;
  // both have digits
  while (l1 != NULL && l2 != NULL) {
    ListNodePtr newNode = createNode(l1->val, l2->val, &overflow);
    if (prevNode) {
      prevNode->next = newNode;
    } else {
      head = newNode;
    }
    prevNode = newNode;
    l1 = l1->next;
    l2 = l2->next;
  }

  // l2 is empty
  while (l1 != NULL) {
    prevNode = prevNode->next = createNode(l1->val, 0, &overflow);
    l1 = l1->next;
  }

  // l1 is empty
  while (l2 != NULL) {
    prevNode = prevNode->next = createNode(0, l2->val, &overflow);
    l2 = l2->next;
  }

  if (overflow) {
    prevNode = prevNode->next = createNode(0, 0, &overflow);
  }

  return head;
}

/* ================== submission ends ===================== */

ListNodePtr createList(int *arr, size_t size) {
  ListNodePtr head = NULL;
  ListNodePtr prevNode = NULL;
  for (size_t index = 0; index < size; ++index) {
    if (index) {
      prevNode = prevNode->next = calloc(sizeof(ListNode), 1);
    } else {
      head = prevNode = calloc(sizeof(ListNode), 1);
    }
    prevNode->val = arr[index];
  }
  return head;
}

void display(ListNodePtr list) {
  while (list) {
    printf("%d ->", list->val);
    list = list->next;
  }
  puts("");
}

void destroy(ListNodePtr list) {
  while (list) {
    ListNodePtr toBeFreed = list;
    list = list->next;
    free(toBeFreed);
  }
}

int main() {
  int list1[4] = {2, 4, 5, 9};
  int list2[4] = {5, 6, 5, 9};
  ListNodePtr l1 = createList(list1, 4);
  ListNodePtr l2 = createList(list2, 4);
  display(l1);
  display(l2);
  ListNodePtr result = addTwoNumbers(l1, l2);
  display(result);
  destroy(l1);
  l1 = NULL;
  destroy(l2);
  l2 = NULL;
  destroy(result);
  result = NULL;
}

```
