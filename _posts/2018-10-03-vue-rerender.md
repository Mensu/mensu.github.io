---
layout: post
title: "Vue 组件的 rerender"
description: "Vue 组件数据-视图双向绑定的一点理解"
subtitle: "the rerender of Vue components"
create-date: 2018-10-03
update-date: 2018-10-03
header-img: ""
author: "Mensu"
tags:
    - 前端
    - 个人理解
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

> 个人浅薄和粗糙的理解，忽略了大量细节，必有疏漏，仅供参考

# 双向绑定

例如下面这样一个简单的 Vue 组件，做的事情是在 `<input>` 中打字，`<input>` 的内容会同步到 `{% raw %}{{ title }}{% endraw %}` 上去

~~~html
<template>
  <section>
    <p>{% raw %}{{ title }}{% endraw %}</p>
    <input type="text" @input="title = $event.target.value">
    <ul>
      <li v-for="item in items" :key="item.key">{% raw %}{{ item.description }}{% endraw %}</li>
    </ul>
  </section>
</template>
<script>
import { getItems } from '...';

export default {
  data() {
    return {
      title: '',
      items: getItems(),
    };
  },
}
</script>
~~~

那问题来了：在 `<input>` 中打字，触发 `this.title = $event.target.value` 之后，**`this.title` 是如何同步到 `{% raw %}{{ title }}{% endraw %}` 上去的呢？**

在稍微深入了解之前，我一直以为是 Vue 通过依赖收集，知道 `{% raw %}{{ title }}{% endraw %}` 读取了 `this.title`，于是在 `this.title` 的 getter 中挂了一个 callback，使得 `this.title` 被 set 时，调用这个 callback，执行 `titleTextNode.textContent = newTitle` 之类的，有针对性地进行更新

但事实上并不是这样的。Vue 没有这么智能。在我看来，Vue 是在 `this.title` 被 set 时，调用 getter 中挂载的 callback，（相当于）执行 `this.$forceUpdate()`，将组件 rerender 一遍。这其实相当于 React 中的 `this.setState()`：rerender 当前组件得到新的 vnode，和 oldVnode 进行 diff，决定是要保留组件做 patch，还是换一个新的组件上去。所以 Vue 也是通过 vnode 脏检查，检查完 `<section>`、`<p>` 的 vnode，最终才发现 `{% raw %}{{ title }}{% endraw %}` 的 vnode 脏了，要进行更新的，而不是直接定位到 `{% raw %}{{ title }}{% endraw %}`。换句话说，Vue 的「有针对性」实际上是组件粒度的

当然在这方面，Vue 和 React 还是有不一样的地方：

- Vue 的响应式对象层级可以很深，例如 `this.titleObj` 是 `{ title: '' }`，这样修改 `title` 时，如 `this.titleObj.title = newTitle`，可以使得只有真正读取 `this.titleObj.title` 的组件才进行 rerender。例如下面的例子中，虽然是在父组件中修改的 `titleObj.title`，但由于父组件没有读取 `titleObj.title`，所以父组件并不会 rerender。只有读取了 `titleObj.title` 的子组件 `<my-title>` 才会 rerender 进行脏检查，发现子组件的 `{% raw %}{{ title }}{% endraw %}` 需要更新

~~~html
<template>
  <section>
    <!-- 这里换成了一个子组件，传入 titleObj，避免当前组件读取 titleObj.title 成为依赖 -->
    <my-title :title-obj="titleObj"></my-title>
    <input type="text" @input="titleObj.title = $event.target.value">
    <ul>
      <li v-for="item in items" :key="item.key">{% raw %}{{ item.description }}{% endraw %}</li>
    </ul>
  </section>
</template>
<script>
import { getItems } from '...';

export default {
  components: {
    'my-title': {
      template: '<p>{% raw %}{{ titleObj.title }}{% endraw %}</p>',
      props: ['titleObj'],
    },
  },
  data() {
    return {
      titleObj: { title: '' },
      items: getItems(),
    };
  },
}
</script>
~~~


- 相比之下，React 默认不能 `this.titleObj.title = newTitle`（mobx 等另论），而是要在父组件中执行 `this.setState({ titleObj: { title: newTitle } })`，改变 `titleObj` 的引用，从而在 rerender 父组件时，能发现子组件的 `props.titleObj` 发生了变化，从而触发子组件的 rerender，更新子组件的 `{title}`

# 推论

知道这些，又有什么用呢？在最开始展示的 Vue 组件中，更新 `this.title` 会触发当前组件 rerender，进行 vnode 的脏检查。而下面还有一个 `<ul>` 列表，这部分的数据其实是没有更新的，`<ul>` 不变，理应不需要检查 `<ul>` 是否需要更新。可是由于当前组件要 rerender，所以 Vue 就会新建一个 ulVnode，等到和 oldUlVnode 比对后，才能知道 `<ul>` 不需要更新。万一 `<ul>` 里的 `<li>` 数量比较多，或者层级比较深，那这个脏检查的过程将会非常非常耗时，打字会变得很卡很卡。而第二个展示的 Vue 组件则不会有这种问题，因为更新 `this.titleObj.title` 只会让子组件 rerender，包含大列表的父组件不动，打字就不会卡。

所以在设计组件的时候，如果组件内的内容过多，那就要考虑一下是否应该拆分出子组件，减轻性能负担，特别是那些带 v-for 的
