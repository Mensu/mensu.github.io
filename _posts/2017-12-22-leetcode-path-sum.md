---
layout: post
title: "LeetCode: 112. Path Sum"
description: "是否存在从根到叶子的路径使得一路上结点的值之和为给定的数"
subtitle: "week 16"
create-date: 2017-12-22
update-date: 2017-12-22
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Easy
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Path Sum - LeetCode](https://leetcode.com/problems/path-sum/description/){:target="_blank"}

Given a binary tree and a sum, determine if the tree has a root-to-leaf path such that adding up all the values along the path equals the given sum.

For example:
Given the below binary tree and ``sum = 22``,

~~~
              5
             / \
            4   8
           /   / \
          11  13  4
         /  \      \
        7    2      1
~~~

return true, as there exist a root-to-leaf path ``5->4->11->2`` which sum is 22.

# Solution

## my naive solution (6 ms)

大概的思路就是递归下去，每次传下去的子问题的 ``sum`` 要减去当前结点的值。

没预料到有负数，不好剪枝。

# Source Code

## submission

~~~c
bool hasPathSum(struct TreeNode *root, int sum) {
  if (root == NULL) {
    return false;
  } else if (root->val == sum && root->left == NULL && root->right == NULL) {
    return true;
  }
  return hasPathSum(root->left, sum - root->val) || hasPathSum(root->right, sum - root->val);
}

~~~
