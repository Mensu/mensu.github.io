---
layout: post
title: "LeetCode: 714. Best Time to Buy and Sell Stock with Transaction Fee"
description: "在合适的时机买卖股票，求最大利润"
subtitle: "week 18"
create-date: 2018-01-04
update-date: 2018-01-04
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Best Time to Buy and Sell Stock with Transaction Fee - LeetCode](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/description/){:target="_blank"}

Your are given an array of integers ``prices``, for which the ``i``-th element is the price of a given stock on day ``i``; and a non-negative integer fee representing a transaction ``fee``.

You may complete as many transactions as you like, but you need to pay the transaction fee for each transaction. You may not buy more than 1 share of a stock at a time (ie. you must sell the stock share before you buy again.)

Return the maximum profit you can make.

**Example 1:**

~~~
Input: prices = [1, 3, 2, 8, 4, 9], fee = 2
Output: 8
Explanation: The maximum profit can be achieved by:
- Buying at prices[0] = 1
- Selling at prices[3] = 8
- Buying at prices[4] = 4
- Selling at prices[5] = 9
- The total profit is ((8 - 1) - 2) + ((9 - 4) - 2) = 8.
~~~

**Note:**

- ``0 < prices.length <= 50000``.
- ``0 < prices[i] < 50000``.
- ``0 <= fee < 50000``.

# Solution

## my naive solution (∞ ms)

too naive to figure out a solution...

## better solution (39 ms)

维护两个利润值：

- ``cash`` 表示当前不持有股票时的最大利润
- ``hold`` 表示当前持有股票时的最大利润

现在，新的一天 ``i`` 到来了。

想得到新的 ``cash`` 利润，有两种策略：什么都不做，以及卖掉当前持有的股票

即，``cash`` vs ``hold + prices[i] - fee``

想得到新的 ``hold`` 利润，有两种策略：什么都不做，以及以当前的价格买入股票

即，``hold`` vs ``cash - prices[i]``

一开始阻碍思考的问题是，我知道这些最大利润，那我怎么知道要什么时候买呢？

动态规划这么回答：都尝试一遍，比较求得最大值。

# Source Code

## submission

~~~c
int maxProfit(int *prices, int pricesSize, int fee) {
  if (pricesSize == 0) {
    return 0;
  }
  int cash = 0;
  int hold = -prices[0];
  for (int i = 1; i < pricesSize; i += 1) {
    int ifSell = hold + prices[i] - fee;
    int ifBuy = cash - prices[i];
    cash = cash > ifSell ? cash : ifSell;
    hold = hold > ifBuy ? hold : ifBuy;
  }
  return cash;
}
~~~

## framework

~~~c
#include <stdio.h>

/* ================== submission begins ===================== */

int maxProfit(int *prices, int pricesSize, int fee) {
  if (pricesSize == 0) {
    return 0;
  }
  int cash = 0;
  int hold = -prices[0];
  for (int i = 1; i < pricesSize; i += 1) {
    int ifSell = hold + prices[i] - fee;
    int ifBuy = cash - prices[i];
    cash = cash > ifSell ? cash : ifSell;
    hold = hold > ifBuy ? hold : ifBuy;
  }
  return cash;
}

/* ================== submission ends ===================== */

int main() {
  int prices[] = {1, 3, 2, 8, 4, 9};
  printf("%d\n", maxProfit(prices, sizeof(prices) / sizeof(int), 2));
}

~~~

