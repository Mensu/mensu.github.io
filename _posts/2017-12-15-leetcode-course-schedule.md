---
layout: post
title: "LeetCode: 207. Course Schedule"
description: "有向图判断是否有环"
subtitle: "week 15"
create-date: 2017-12-15
update-date: 2017-12-15
header-img: ""
author: "Mensu"
tags:
    - LeetCode
    - LeetCode - Medium
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.


# Description

> [Course Schedule - LeetCode](https://leetcode.com/problems/course-schedule/description/){:target="_blank"}

There are a total of n courses you have to take, labeled from ``0`` to ``n - 1``.

Some courses may have prerequisites, for example to take course 0 you have to first take course 1, which is expressed as a pair: ``[0,1]``

Given the total number of courses and a list of prerequisite pairs, is it possible for you to finish all courses?

For example:

~~~
2, [[1,0]]
~~~

There are a total of 2 courses to take. To take course 1 you should have finished course 0. So it is possible.

~~~
2, [[1,0],[0,1]]
~~~

There are a total of 2 courses to take. To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible.

**Note:**
1. The input prerequisites is a graph represented by a list of edges, not adjacency matrices. Read more about how a graph is represented.
2. You may assume that there are no duplicate edges in the input prerequisites.

# Solution

## my naive solution (13 ms)

不难发现，题目所给的前置条件构成有向图。而不能完成的条件便是这个图里有环。所以只要判断有向图有没有环就好了。方法有很多：

- 先 DFS 一波，得到 ``pre`` 和 ``post``，然后遍历每个边，看是不是回边
- 寻找入度为 0 的点，从这个点开始，维护入度为 0 的队列（像拓扑排序）。如果找不到入度为 0 的点：此时若存在入度不为 0 的点，说明有环
- 在 DFS 的过程中，给点标注上 ``not visited``、``visiting``、``visited`` 的状态。如果访问到 ``visiting`` 的点，说明有环

这里使用第三种方法

# Source Code

## submission

~~~cpp
#include <iostream>
#include <vector>

class Solution {
  struct Point {
    int in_degree;
    int state;
    std::vector<int> end;
    Point(): in_degree(0), state(0) {}
  };
 public:
  std::vector<Point> points;
  bool canFinish(int numCourses, const std::vector<std::pair<int, int>>& prerequisites) {
    points.clear();
    points.reserve(numCourses);
    for (int i = 0; i < numCourses; i += 1) {
      points.push_back(Point());
    }
    for (const auto &one_pair : prerequisites) {
      points[one_pair.first].end.push_back(one_pair.second);
      points[one_pair.second].in_degree += 1;
    }

    int cur = -1;
    for (int i = 0; i < numCourses; i += 1) {
      if (points[i].in_degree == 0) {
        cur = i;
      }
    }

    if (cur == -1) {
      return false;
    }

    while (cur != -1) {
      bool toContinue = DFS(cur);
      if (not toContinue) return false;
      cur = -1;
      for (int i = 0; i < numCourses; i += 1) {
        if (points[i].state == 0) {
          cur = i;
        }
      }
    }

    return true;
  }

  bool DFS(int cur) {
    int toContinue = 0;
    points[cur].state = 1;  // visiting
    for (const auto &end : points[cur].end) {
      switch (points[end].state) {
        case 0:
          toContinue = DFS(end);
          if (!toContinue) return false;
          break;
        case 1:
          return false;
        case 2:
          continue;
      }
    }
    points[cur].state = 2;  // visited
    return true;
  }
};

~~~

## framework

~~~cpp
#include <iostream>

/* ================== submission begins ===================== */

#include <vector>

class Solution {
  struct Point {
    int in_degree;
    int state;
    std::vector<int> end;
    Point(): in_degree(0), state(0) {}
  };
 public:
  std::vector<Point> points;
  bool canFinish(int numCourses, const std::vector<std::pair<int, int>>& prerequisites) {
    points.clear();
    points.reserve(numCourses);
    for (int i = 0; i < numCourses; i += 1) {
      points.push_back(Point());
    }
    for (const auto &one_pair : prerequisites) {
      points[one_pair.first].end.push_back(one_pair.second);
      points[one_pair.second].in_degree += 1;
    }

    int cur = -1;
    for (int i = 0; i < numCourses; i += 1) {
      if (points[i].in_degree == 0) {
        cur = i;
      }
    }

    if (cur == -1) {
      return false;
    }

    while (cur != -1) {
      bool toContinue = DFS(cur);
      if (not toContinue) return false;
      cur = -1;
      for (int i = 0; i < numCourses; i += 1) {
        if (points[i].state == 0) {
          cur = i;
        }
      }
    }

    return true;
  }

  bool DFS(int cur) {
    int toContinue = 0;
    points[cur].state = 1;  // visiting
    for (const auto &end : points[cur].end) {
      switch (points[end].state) {
        case 0:
          toContinue = DFS(end);
          if (!toContinue) return false;
          break;
        case 1:
          return false;
        case 2:
          continue;
      }
    }
    points[cur].state = 2;  // visited
    return true;
  }
};

/* ================== submission ends ===================== */

int main() {
  Solution s;
  {
    std::vector<std::pair<int, int>> p {
      {1, 0},
    };
    std::cout << s.canFinish(2, p) << std::endl;
  }
  {
    std::vector<std::pair<int, int>> p {
      {1, 0},
      {0, 1},
    };
    std::cout << s.canFinish(2, p) << std::endl;
  }
  {
    std::vector<std::pair<int, int>> p {
      {1, 0},
      {1, 2},
      {0, 1},
    };
    std::cout << s.canFinish(3, p) << std::endl;
  }
  {
    std::vector<std::pair<int, int>> p {
      {0, 1},
      {1, 2},
      {2, 0},
      {3, 0},
    };
    std::cout << s.canFinish(4, p) << std::endl;
  }
}

~~~
