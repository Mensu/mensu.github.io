---
layout: post
title: "Chrome 下的 CSS 样式重计算"
description: "简单介绍 Chrome 下 CSS 样式重计算的过程"
subtitle: "CSS style recalculation in Chrome"
create-date: 2020-04-05
update-date: 2020-04-07
header-img: ""
author: "Mensu"
tags:
    - 前端
    - 个人理解
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

> 个人浅薄和粗糙的理解，忽略了大量细节，必有疏漏，仅供参考

# 前言

在 Chrome 下研究的网页性能问题时，我们偶尔会遇到样式重计算 Recalculate Style 耗时过长的问题，而常用的分析工具 Performance 提供了影响节点数 Elements Affected、强制立即进行样式重计算的代码调用 Recalculation Forced、以及第一次使样式失效的代码调用 First Invalidated 的信息

但仅靠这些信息，对耗时过长问题的追查并没有太大的帮助。Elements Affected 并没有告诉我们哪些节点受到影响，以及为什么受到影响。而 Recalculation Forced 和 First Invalidated 也仅仅是能帮助我们减少或避免 JS 里强制样式重计算，但并不能减少一帧结束前样式重计算的耗时

为此，我们需要对 Chrome 的样式重计算的实现有所了解

# 样式重计算的过程概述

一次样式重计算的耗时 = 某个节点的样式重计算耗时 × 脏节点的数量

「某个节点的样式重计算」主要分成两个步骤
1. 遍历所有 CSS 规则，找到匹配当前节点的 CSS 规则
2. 根据这些规则计算得到样式

> 其实如果能减少 CSS 规则的数量，一定程度上也能减少「某个节点的样式重计算」的耗时。不过这在实际项目中可能不太容易做到：能减少的规则数量可能是有限的

脏节点主要是通过「标脏」过程产生的。标脏一般发生在样式重计算之前的某些时机。例如，如果存在规则 `.a {}`，那么当一个节点增加了 `.a` 即 `node.classList.add('a')` 时，这个节点就会被标脏

Chrome 的标脏策略是保守的，也就是说它能保证所有需要重新计算样式的节点都被标脏，但是可能也存在一些样式其实没有变化的节点也被标脏的情况

> 这背后其实是一种权衡：
> - 如果标脏算法比较简单，那么它可能不够精确，可能会导致多余的节点被标脏，增加脏节点的数量，结果增加一次样式重计算的耗时
> - 如果标脏算法足够精确，那它可能非常复杂，虽然能确保只有需要重新计算样式的节点才被标脏，但是算法本身的耗时也会变长，结果增加标脏过程的耗时

标脏按照时机可以分为两种。在某次代码调用导致样式失效时，如果已经可以确定这次调用会导致哪些节点需要标脏，那么这些节点就会被「立即标脏」。否则，将会记录下一些「线索」，等到下一次样式重计算之前再统一利用这些「线索」进行标脏，即「统一标脏」

> - 如果存在规则 `.a {}`，那么当一个节点增加了 `.a` 时，这个节点可以被「立即标脏」
> - 如果存在规则 `.a .b {}`，那么当一个节点增加了 `.a` 时，需要对该节点下面的 `.b` 节点进行标脏。可是在后面的调用中，该节点下 `.b` 节点的数量和位置可能会发生变化，如果要追踪这些变化更新标脏状态的话，算法会变得复杂很多。所以这里的做法是，在该节点记录「我下面的 `.b` 节点需要标脏」的线索，等到「统一标脏」时，再对该节点下面的 `.b` 节点进行标脏

相比之下，脏节点数量的优化空间会更大一些。这部分优化空间主要来源于我们之前缺乏这方面的经验和知识，结果写出来的 CSS 选择器比较奔放，导致许多不必要的节点也被标脏了，比如下面这些写法

- `li + span`
- `[class^="dialog-"] [class^="dialog-body-"]`
- `.main [class*="icon-"]`

如何优化脏节点的数量呢？我们先要了解标脏依据的「线索」是如何产生的

# feature 和 invalidation set

通过遍历 CSS 规则中的选择器，可以得到 feature，进而形成 invalidation set

## feature

feature 是从 CSS 选择器中提取出来的特征，有下面几种类型
- `#id1`：可以提取出 `id1` 作为 id 特征
- `.class1` `.class1.class2`：可以提取出 `class1` 作为 class 特征
- `[attribute1]` `[attribute1^=""]`：可以提取出 `attribute1` 作为 attribute 特征
- `tagName1`：可以提取出 `tagName1` 作为 tagName 特征

对于复合选择器，如 `span.icon-checked[title]`，一般只留一个特征，优先级按照上述顺序从高到低排列

## invalidation set

invalidation set 是用来标脏的「线索」，在从右到左遍历 CSS 规则中的选择器的过程中，Chrome 会一边收集「最右选择器」的 feature，一边为每个 id、class、attribute 生成 invalidation set

> 注意：这里不会为 tagName 生成 invalidation set。如果 tagName 出现在 `+` `~` 的左侧，则会相当于为 `*` 生成 sibling invalidation set

下面我们举几个例子，说明一下这个过程

### `.a .b .c`

从右到左遍历选择器，会先遇到 `.c`。它是「最右选择器」，所以会收集到特征 `.c`。并为 `.c` 生成一个 `invalidateSelf` 的 invalidation set，意思是如果有节点增加或删除 `.c`，需要把自己标脏。我们简单标记为 `.c -> { <self> }`

接着遇到 `.b`。它不是「最右选择器」，所以不收集特征。为 `.b` 生成一个 invalidation set，内容是「最右选择器」的特征 `.c`，意思是如果有节点增加或删除 `.b`，需要在该节点记录「我下面的 `.c` 节点需要标脏」的线索。我们简单标记为 `.b -> { .c }`

接着遇到 `.a`。它同样不是「最右选择器」，所以不收集特征。为 `.a` 生成一个 invalidation set，内容是「最右选择器」的特征 `.c`，意思是如果有节点增加或删除 `.a`，需要在该节点记录「我下面的 `.c` 节点需要标脏」的线索。我们简单标记为 `.a -> { .c }`

~~~
.c -> { <self> }
.b -> { .c }
.a -> { .c }
~~~

由此可以看出，如果是某个节点增加或删除 `.a`，那么它下面的 `.c` 都会被标脏，而不会管 `.c` 是不是在 `.b` 下面。这是目前的标脏算法容易标脏多余节点的体现

### `.d + .e + .f`

其实在 `.a .b .c` 的例子中，收集的特征叫后代特征 descendant features，创建的 invalidation set 叫 descendant invalidation set。而对于 `+` 和 `~` 选择器，用的是 sibling features 和 sibling invalidation set。descendant 和 sibling 能够同时存在，发挥着不同的作用

从右到左遍历选择器，会先遇到 `.f`。它是「最右选择器」，所以会收集到后代特征 `.f`。并为 `.f` 生成一个 `invalidateSelf` 的 descendant invalidation set。我们简单标记为 `.f -> D{ <self> }`

接着遇到 `+`。因为目前还没有兄弟特征，所以需要收集「当前所在的连续兄弟选择器序列中」的「最右选择器」的特征作为兄弟特征 `.f`，这恰好也是后代特征

接着遇到 `.e`。它不是「最右选择器」，所以不收集后代特征。因为目前有兄弟特征，所以为 `.e` 生成一个 sibling invalidation set，内容是当前的兄弟特征 `.f`。又因为 `.f` 也是最右选择器的特征，所以需要 `invalidateSelf`。意思是如果有节点增加或删除 `.e`，需要在该节点记录「我后一个节点如果是 `.f` 节点则需要标脏」的线索。我们简单标记为 `.e -> S{ .f, <self> }`

> - 对 descendant invalidation set `.a -> D{ .b, <self> }` 来说，`.a` 需要标脏
> - 对 sibling invalidation set `.a -> S{ .b, <self> }` 来说，`.b` 需要标脏

接着遇到 `+`。因为目前已经有兄弟特征，所以不用再收集

接着遇到 `.d`。它不是「最右选择器」，所以不收集后代特征。因为目前有兄弟特征，所以为 `.d` 生成一个 sibling invalidation set，内容是当前的兄弟特征 `.f`。又因为 `.f` 也是最右选择器的特征，所以需要 `invalidateSelf`。意思是如果有节点增加或删除 `.d`，需要在该节点记录「我后两个节点如果是 `.f` 节点则需要标脏」的线索。我们简单标记为 `.d -> S{ .f, <self> }`

~~~
.f -> D{ <self> }
.e -> S{ .f, <self> }
.d -> S{ .f, <self> }
~~~

其实，对于 `.d -> S{ .f, <self> }`，除了节点增加或删除 `.d` 时需要记录「我后两个节点如果是 `.f` 节点则需要标脏」的线索，还有一种情况就是：当某个节点插入到 DOM 树或从 DOM 树删除时，如果该节点和它的前两个节点匹配 `.d` 且该节点存在被 `+` 和 `~` 规则影响的兄弟节点，则需要在该节点的父节点记录「我下面的 `.f` 节点需要标脏」的线索

这看上去应该比较难懂，举个例子，当我们在 `span#s4` 前面插入一个节点时，它的前两个节点中 `span#s3.d` 匹配到 `.d`，而且也有兄弟节点 `span#s6` 被 `.child + .child` 影响，所以该节点的父节点 `span#s1.parent` 会记录「我下面的 `.f` 节点需要标脏」的线索，结果就会标脏 9 个 `.f` 节点（`#f1` 到 `#f9`）和 1 个插入节点。其实这 9 个 `.f` 节点是没必要标脏的

~~~html
<style>
  .child + .child {
    color: unset;
  }
  .d + .e + .f {
    color: unset;
  }
</style>
<span id="s1" class="parent">
  <span id="s2"></span>
  <span id="s3" class="d">
    <span id="f1" class="f"></span>
    <span id="f2" class="f"></span>
    <span id="f3" class="f"></span>
    <span id="f4" class="f"></span>
    <span id="f5" class="f"></span>
    <span id="f6" class="f"></span>
    <span id="f7" class="f">
      <span id="f8" class="f"></span>
    </span>
  </span>
  <span id="s4"></span>
  <span id="s5" class="child"></span>
  <span id="s6" class="child">
    <span id="f9" class="f"></span>
  </span>
</span>
~~~


### `.g .h + .i .j + .k .l`

从右到左遍历选择器，会先遇到 `.l`。它是「最右选择器」，所以会收集到后代特征 `.l`。并为 `.l` 生成一个 `invalidateSelf` 的 descendant invalidation set。我们简单标记为 `.l -> D{ <self> }`

接着遇到 `.k`。它不是「最右选择器」，所以不收集后代特征。为 `.k` 生成一个 descendant invalidation set，内容是「最右选择器」的特征 `.l`，我们简单标记为 `.k -> D{ .l }`

接着遇到 `+`。因为目前还没有兄弟特征，所以需要收集「当前所在的连续兄弟选择器序列中」的「最右选择器」的特征作为兄弟特征 `.k`

接着遇到 `.j`。它不是「最右选择器」，所以不收集后代特征。因为目前有兄弟特征，所以为 `.j` 生成一个 sibling invalidation set，内容是当前的兄弟特征 `.k` 以及后代特征 `.l`，意思是如果有节点增加或删除 `.j`，需要在该节点记录「我后一个节点如果是 `.k` 节点，则需要将 `.k` 节点下面的 `.l` 标脏」的线索。我们简单标记为 `.j -> S{ .k, D{ .l } }`

接着遇到 `.i`。因为连接 `.i` 和 `.j` 的不是 `+` `~` 选择器了，所以清空兄弟特征。为 `.i` 生成一个 descendant invalidation set，内容是「最右选择器」的特征 `.l`，我们简单标记为 `.i -> D{ .l }`

接着遇到 `+`。因为目前还没有兄弟特征，所以需要收集「当前所在的连续兄弟选择器序列中」的「最右选择器」的特征作为兄弟特征 `.i`

接着遇到 `.h`。它不是「最右选择器」，所以不收集后代特征。因为目前有兄弟特征，所以为 `.h` 生成一个 sibling invalidation set，内容是当前的兄弟特征 `.i` 以及后代特征 `.l`，意思是如果有节点增加或删除 `.h`，需要在该节点记录「我后一个节点如果是 `.i` 节点，则需要将 `.i` 节点下面的 `.l` 标脏」的线索。我们简单标记为 `.h -> S{ .i, D{ .l } }`

接着遇到 `.g`。因为连接 `.g` 和 `.h` 的不是 `+` `~` 选择器了，所以清空兄弟特征。为 `.g` 生成一个 descendant invalidation set，内容是「最右选择器」的特征 `.l`，我们简单标记为 `.g -> D{ .l }`

~~~
.l -> D{ <self> }
.k -> D{ .l }
.j -> S{ .k, D{ .l } }
.i -> D{ .l }
.h -> S{ .i, D{ .l } }
.g -> D{ .l }
~~~

由此可以看出，如果是某个节点增加或删除 `.g`，那么它下面的 `.l` 都会被标脏，而不会管 `.l` 是不是满足 `.g .h + .i .j + .k .l` 的约束。这也是目前的标脏算法容易标脏多余节点的体现

# 应用：分析脏节点过多的原因

我们一般使用 tracing 工具 `chrome://tracing`：点击左上角的 Record 按钮，选择 `Javascript and rendering`，并在 Edit categories 里增加勾选 `devtools.timeline.invalidationTracking`。录制后，可以分析 `Document::updateStyleInvalidationIfNeeded` 和 `Document::updateStyle` 底下的相关信息

## `li + span`

因为 li 是 tagName，所以相当于是为 `*` 生成 sibling invalidation set `* -> S{ span, <self> }`。也就是说，如果往父节点 A 插入一个子节点 B，而且 B 有兄弟节点被 `+` `~` 规则影响，那么，考虑到 B 前面任意节点都能匹配到 `*`，使得该 sibling invalidation set 发挥作用，所以它的父节点 A 会记录「我下面的 `span` 节点都要被标脏」的线索，结果 A 下面的 `span` 节点都会被标脏。如果 A 下面的 `span` 节点数量很多，那么脏节点的数量也会很多

## `[class^="dialog-"] [class^="dialog-body-"]`

会生成 descendant invalidation set `[class] -> { [class] }`，也就是说，如果节点 A 改了 class 属性（例如，增加或删除一个类），那么 A 下面所有匹配到 `[class]` 的节点都会被标脏。如果 A 下面有 class 的节点数量很多，那么脏节点的数量也会很多

## `.main [class*="icon-"]`

会生成 descendant invalidation set `.main -> { [class] }`，也就是说，如果节点 A 增加或删除 `.main`，那么 A 下面所有匹配到 `[class]` 的节点都会被标脏。如果 A 下面有 class 的节点数量很多，那么脏节点的数量也会很多

# 快速拒绝

上面提到，「某个节点的样式重计算」的第一步是「遍历所有 CSS 规则，找到匹配当前节点的 CSS 规则」。在过滤掉一些不匹配的 CSS 规则，会使用「快速拒绝」的算法

因为节点的样式重计算是从上到下进行的，所以可以维护当前节点的祖先路径，将祖先路径的选择器分别 hash 一下加入布隆过滤器。然后在确定某条规则是否可以被快速拒绝时，看看从这条规则的选择器里收集的 hash 是否在布隆过滤器里。如果不在，说明该节点不满足这条规则的祖先选择器约束，也就是说这条规则可以被快速拒绝

例如下面的例子，在计算 `div#d4` 的样式时，可以知道祖先路径是 `div#d1 div#d2 div#d3`。将 `div#d1`、`div#d2`、`div#d3` 加入布隆过滤器。如果有一条规则是 `.a #d4 {}`，而且发现 `.a` 的 hash 不在布隆过滤器里，说明 `div#d4` 节点没有父元素是 `.a`，则可以快速拒绝这条在 `.a` 节点下才能匹配到规则

~~~html
<div id="d1">
  <div id="d2">
    <div id="d3">
      <div id="d4">
      </div>
    </div>
  </div>
</div>
~~~

但是，如果某个节点 A `display: none` 了，然后对 A 的子节点进行样式重计算，这种重计算因为不是从上到下进行的，没有祖先路径，则无法应用快速拒绝。这可能导致一些原本可以被快速拒绝的规则没被过滤掉
