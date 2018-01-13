---
layout: post
title: "Algorithm: 8.3"
description: "STINGY SAT"
subtitle: "week 17"
create-date: 2017-12-27
update-date: 2017-12-27
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Hard
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

$$STINGY SAT$$ is th following problem: given a set of clauses (each a disjunction of literals) and an integer $$k$$, find a satisfying assignment in which at most $$k$$ variables are $$true$$, if such an assignment exists. Prove that $$STINGY SAT$$ is **NP**-complete.

# Solution

## my naive solution

对一个 $$SAT$$ 问题的实例 $$I$$，变量个数为整数 $$k$$。对应 $$STINGY SAT$$ 问题的实例为 $$(I, k)$$。

若 $$(I, k)$$ 有解 $$S$$，因为 $$k$$ 只是变量个数，并不影响问题的实质，所以 $$S$$ 也是 $$I$$ 的解。反之，若 $$I$$ 有解 $$S$$，不难在多项式时间内代入布尔表达式，得到 $$S$$ 是 $$(I, k)$$ 的解。故 $$(I, k)$$ 有解是 $$I$$ 有解的充要条件。

所以 $$STINGY SAT$$ 问题可以归约到 $$SAT$$ 问题。又因为 $$SAT$$ 问题是 **NP** 完全问题，所以所以 $$STINGY SAT$$ 问题也是 **NP** 完全问题。证毕。
