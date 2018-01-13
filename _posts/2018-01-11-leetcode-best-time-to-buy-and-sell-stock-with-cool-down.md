---
layout: post
title: "309. Best Time to Buy and Sell Stock with Cooldown"
description: "在合适的时机买卖股票，求最大利润"
subtitle: "week 19"
create-date: 2018-01-11
update-date: 2018-01-11
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Best Time to Buy and Sell Stock with Cooldown - LeetCode](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/description/){:target="_blank"}

Say you have an array for which the $$i^{th}$$ element is the price of a given stock on day $$i$$.

Design an algorithm to find the maximum profit. You may complete as many transactions as you like (ie, buy one and sell one share of the stock multiple times) with the following restrictions:

- You may not engage in multiple transactions at the same time (ie, you must sell the stock before you buy again).
- After you sell your stock, you cannot buy stock on next day. (ie, cooldown 1 day)

**Example:**

~~~
prices = [1, 2, 3, 0, 2]
maxProfit = 3
transactions = [buy, sell, cooldown, buy, sell]
~~~

**Credits:**

Special thanks to @dietpepsi for adding this problem and creating all test cases.

# Solution

## my naive solution (6 ms)

参考 [Best Time to Buy and Sell Stock with Transaction Fee](https://mensu.github.io/2018/01/04/leetcode-best-time-to-buy-and-sell-stock-with-transaction-fee.html){:target="_blank"} 的思路，不难进行变通。

这次有了冷却时间，所以买股票时，昨天不能卖出股票。也就是说，``sell``（即 ``cash``）不能是昨天卖出股票得到的最大利润，但可以是前天卖出股票得到的最大利润 ``prevSell``。如果昨天的最大利润不是通过卖出股票得到，也有 ``sell = prevSell``，也相当于用了前天的利润。

也就是说，要多维护一个 ``prevSell``，记录 ``sell`` 之前的值。

# Source Code

## submission

~~~c
int maxProfit(int *prices, int pricesSize) {
  if (pricesSize == 0) {
    return 0;
  }
  int sell = 0;
  int prevSell = 0;
  int hold = -prices[0];
  for (int i = 1; i < pricesSize; i += 1) {
    int ifSell = hold + prices[i];
    int ifBuy = prevSell - prices[i];
    prevSell = sell;
    sell = sell > ifSell ? sell : ifSell;
    hold = hold > ifBuy ? hold : ifBuy;
  }
  return sell;
}

~~~

## framework

~~~c
#include <stdio.h>

/* ================== submission begins ===================== */

int maxProfit(int *prices, int pricesSize) {
  if (pricesSize == 0) {
    return 0;
  }
  int sell = 0;
  int prevSell = 0;
  int hold = -prices[0];
  for (int i = 1; i < pricesSize; i += 1) {
    int ifSell = hold + prices[i];
    int ifBuy = prevSell - prices[i];
    prevSell = sell;
    sell = sell > ifSell ? sell : ifSell;
    hold = hold > ifBuy ? hold : ifBuy;
  }
  return sell;
}

/* ================== submission ends ===================== */

int main() {
  int prices[] = {1, 3, 2, 8, 4, 9};
  printf("%d\n", maxProfit(prices, sizeof(prices) / sizeof(int), 2));
}

~~~

