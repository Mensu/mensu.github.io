---
layout: post
title: "基于 Github Pages ＋ Jekyll 的网站开发环境的搭建"
description: "自己搭建本网站时的经验"
subtitle: "establish the development environment for websites based on Github Pages and Jekyll"
create-date: 2016-02-26
update-date: 2016-02-28
header-img: ""
author: "Mensu"
tags:
    - 经验
---

The article was posted on <i>{{ page.create-date | date: "%Y-%m-%-d" }}</i> for the first time.

# 适用人群

- 打算用 [Github Pages](https://pages.github.com) 上用 Markdown 写博客，建立个人博客网站，所以想在本地搭建相应调试环境的人
- 使用 Mac 或 Windows 的操作系统

# 需要安装的东西

基础程序——ruby、git  
Gem——jekyll、jekyll-paginate

# 需要了解的语言

- Liquid ：用来制作 html 文件的模板
- HTML、CSS、JavaScript ：之类的网页前端语言
- kramdown ：Github Pages 上的 Markdown 
- cmd / 终端的语法
- 一定的电脑操作能力，如打开指定路径的文件夹、通过安装包安装软件、修改系统的环境变量

# 安装 Ruby

Mac 上：

- 应该是预装了 Ruby 的，修改下载源即可（见下面）

Windows 上：

- 到 [rubyinstaller.org](http://rubyinstaller.org) 下载安装包（可能被封了）。也可以自行在网上找安装包
- 安装时最好选中 “Add Ruby executables to your PATH”：

![add Ruby executables to the user environment variable Path](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-add-Ruby%20executables-to-the-user-environment-variable-Path.png)

或添加以下路径到环境变量 Path 中（注意换成自己安装时选的安装目录）

~~~
C:\Ruby22-x64\bin
~~~

安装完成后，打开 cmd / 终端，就能直接输入 Ruby 命令了

**注意**，中国用户最好使用淘宝提供的 Gems 镜像源，参见 [ruby.taobao.org](https://ruby.taobao.org) ，否则待会儿安装 Gem 时可能会出现

> ERROR:  While executing gem ... (Gem::RemoteFetcher::FetchError)  &nbsp;&nbsp;&nbsp;&nbsp;Errno::ECONNRESET: An existing connection was forcibly closed by the remote host. - SSL_connect (https://api.rubygems.org/quick/Marshal.4.8/jekyll-3.1.2.gemspec.rz)

![cannot connect to rubygems.org](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-cannot-connect-to-rubygems-org.png)

解决方法，简单来说，就是输入这句然后回车

~~~
gem sources --add https://ruby.taobao.org/ --remove https://rubygems.org/
~~~

看到

>https://ruby.taobao.org/ added to sources  https://rubygems.org/ removed from sources

就可以放心了

![replace https://rubygems.org/ with https://ruby.taobao.org/ in mainland China](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-replace.png)

# 安装 Gem

Mac 上和 Windows 上的安装命令大同小异  
Mac 上是在 `$` 后面输入 `sudo 命令`（回车后还要输 Mac 的密码，密码不回显，输完回车即可）：

~~~
...$ sudo gem install jekyll
~~~ 

![sudo gem install jekyll on Mac](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-sudo-gem-install-jekyll-on-Mac.png)

Windows 上直接：

~~~
...>gem install jekyll
~~~

![gem install jekyll in Windows](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-gem-install-jekyll-in-Windows.png)

安装所需的 2 个 Gem ，用的是下面的命令（再按照不同平台修改）

~~~
gem install jekyll jekyll-paginate
~~~

![gem install jekyll jekyll-paginate in Windows](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-gem-install-jekyll-jekyll-paginate-in-Windows.png)

- jekyll 是用来依照模板生成网站的，是 Github Pages 的基础
- jekyll-paginate 是 paginate 属性用的，可以用来生成博客文章的预览

# 安装 Git

- 到 [git-scm.com/download](http://git-scm.com/download) 下载 Git 安装包并安装
- Windows 上还要将以下路径加入环境变量 Path 中（注意换成自己安装时选的安装目录）

~~~
C:\Program Files\Git\binC:\Program Files\Git\mingw64\libexec\git-core
~~~

![add the paths above to the environment variable Path in Windows](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-add-the-paths-above-to-the-environment-variable-Path-in-Windows.png)

# Git 和 Github 的准备工作

我们可以用 Git 命令来操作，也可以用 Github 的图形化界面。我比较懒，选后者。

## 安装 Github Desktop

Mac 下：

- 在 [Github Pages](https://pages.github.com) 中的 “What git client are you using?” 下选择 “I don't know”，下面就会出现下载按钮，下载完安装即可

![get download button of Github Desktop for Mac](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-get-download-button-of-Github-Desktop-for-Mac.png)

Windows 下：

- 用 IE 打开 https://github-windows.s3.amazonaws.com/GitHub.application 这个网址，等它慢慢下载、安装即可

![download Github Desktop in Windows](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-download-Github-Desktop-in-Windows.png)

## 添加 SSH key

如果使用的是 Github Desktop，这一步就可以省略了。参见

1. [Generating a new SSH key and adding it to the ssh-agent](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
2. [Adding a new SSH key to your GitHub account](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account)

简单来说，首先要先有个 Github 账号，记住注册时用的用户名和邮箱 

在 Git Bash / 终端 下输入（Windows下右键-粘贴）

~~~
git config --global user.name "Github 用户名"
git config --global user.email "注册 Github 时用的邮箱"
~~~

接下来生成 SSH key

~~~
ssh-keygen -t rsa -b 4096 -C "注册 Github 时用的邮箱"
~~~

然后下面三个问题，全部回车，如果看不懂的话

>Enter a file in which to save the key (/Users/you/.ssh/id_rsa):  
>Enter passphrase (empty for no passphrase):  
>Enter same passphrase again:

![set configurations, generate SSH key and press Enter three times](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-set-configurations-generate-SSH-key-and-press-Enter-three-times.png)

接着，将 SSH key 复制到剪贴板：打开 cmd / 终端，  
Mac 上输入

~~~
pbcopy < ~/.ssh/id_rsa.pub
~~~

![copy SSH key to clipborad on Mac](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-copy-SSH-key-to-clipborad-on-Mac.png)

Windows 上输入

~~~
clip < %userprofile%\.ssh\id_rsa.pub
~~~

![copy SSH key to clipborad in Windows](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-copy-SSH-key-to-clipborad-in-Windows.png)

或打开 C:\Users\账户名\.ssh 这个文件夹，用记事本等文本编辑器打开里面的 id_rsa.pub 文件，将内容复制到剪贴板  
应该是类似这样的内容：

>ssh-rsa AAAAB3NzaC1yc2E...sPe7slAHQ== xx@xx.com

![copy SSH key to clipborad in Windows manually](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-copy-SSH-key-to-clipborad-in-Windows-manually.png)

最后上 [Github 设置](https://github.com/settings/ssh)，在 Settings - SSH keys 页面中，点击 New SSH key，添加剪贴板里的内容即可

![add SSH key on Github Settings](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-settings.png)

# 进入调试环境

打开 cmd / 终端，用 cd 命令等方式访问网站文件所在的本地文件夹，输入

~~~
git checkout master
jekyll serve
~~~

即可通过在浏览器访问 localhost:4000 来访问我们的网站了。master 可以换成其他 branch 的名字。如果是使用 master 这个 branch，可以不输 `git checkout master` ，直接 `jekyll serve`

![jekyll serve](http://7xrahq.com1.z0.glb.clouddn.com/establish-development-environment-jekyll-serve.png)

# kramdown 语法

参见 [kramdown.gettalong.org/syntax.html](http://kramdown.gettalong.org/syntax.html)

和一般的 Markdown 相比，主要有以下几点需要注意：

- kramdown 中代码块必须使用三个波浪号

~~~
 ~~~
 高亮的代码块
 ~~~
~~~

不识别三个反引号

~~~
 ```
 代码块无法高亮
 ```
~~~

行内代码用两个反引号

~~~
`行内代码`
~~~

因为 rouge 语法高亮是等到页面加载完以后才进行的，所以希望页面一打开就有一点高亮效果的话，建议在 \<head\> 标签中加入

~~~
<link rel="stylesheet" href="/css/syntax.css">
~~~

其中的 css 文件来源于 [syntax.css](https://github.com/mojombo/tpw/blob/master/css/syntax.css)  
另外参见 [修改 syntax.css](http://stackoverflow.com/questions/11093233/how-to-support-scrolling-when-using-pygments-with-jekyll)

- 标题：#空格标题内容

~~~
# h1
## h2
~~~

- 换行：空开一行或者在上一行的末尾加两个空格，两种方式效果不同

~~~
the first line

a second line
~~~

~~~
the first line空格空格
a second line
~~~

- 没有 [TOC]

# Liquid 常用语法

Jekyll 这玩意用到了 Liquid 的语法（用大括号围起来的语句），可以制作网页的模板

具体参见 [Jekyll 官方文档](https://jekyllrb.com/docs/home/) 和 [Liquid 官方文档](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers)

在 Liquid 中，`{% raw %}{% xx %}{% endraw %}` 用来实现一些功能，如 `{% raw %}{% assign x = site.title %}{% endraw %}`；而 `{% raw %}{{ xxx }}{% endraw %}` 相当于 print xxx

整个 repository 包括但不限于：

- _includes 文件夹：配合 `{% raw %}{% include xx %}{% endraw %}` 语句（像 C 里的 #include ），例如

~~~
<!-- /index.html 中 -->
<html>
  {% raw %}{% include index-head.html %}{% endraw %}
  
  {% raw %}{% include index-body.html %}{% endraw %}
</html>
<!-- END -->

<!-- /_includes/index-head.html 中 -->
<head>
  <meta charset="uft-8">
  xxx
</head>
<!-- END -->

<!-- /_includes/index-body.html 中 -->
<body>
  xxxx
</body>
<!-- END -->
~~~

将 index-head.html、index-body.html 放在 _includes 文件夹中，index.html 放在外面，最终生成的index.html（在 _site 文件夹里）就长这样：

~~~
<html>
  <head>
  <meta charset="uft-8">
  xxx
</head>
  
  <body>
  xxxx
</body>
</html>
~~~

- _layouts 文件夹：存放网页模板，配合 layout 属性使用，例如

~~~
<!-- /_layouts/post-A.html 中 -->
<html>
  <head>
    ...
  </head>
  <body>
    <article>
    
    {% raw %}{{ content }}{% endraw %}
    
    </article>
  </body>
</html>
<!-- END -->

<!-- article1.html 中 -->
---
layout: post-A
  注意，不加.html
---
<header>
  <h1>title</h1>
</header>
<section>
  ...
</section>
<!-- END -->
~~~

最终生成的 article1.html 是

~~~
<html>
  <head>
    ...
  </head>
  <body>
    <article>
    
    <header>
  <h1>title</h1>
</header>
<section>
  ...
</section>

    </article>
  </body>
</html>
~~~

- _posts 文件夹：想用 Markdown 写博客，就可以把写好的 md 文件放在这里。里面的 md 文件会自动生成相应网页。注意，命名是有要求的

命名为 2016-02-27-article-1.md 的文件  
将会生成 /2016/02/27/article-1.html

- 局部变量

html 或 md 文件可以定义局部变量。局部变量放在两个`---`之间，例如 md 文件最上方可以设置所使用的 layout 以及 title 局部变量

~~~
---
layout: post-A
title: My first Article
create-date: 2016-02-27
---

# My first Article
## subtitle
**content**
~~~

局部变量 title 通过 `page.title` 访问

~~~
<!-- /_layouts/post-A.html 中 -->
<html>
  <head>
    <title>{% raw %}{{ page.title }}{% endraw %} | My Blog</title>
  </head>
  <body>
    <article>
    
    {% raw %}{{ content }}{% endraw %}
    
    </article>
  </body>
</html>
<!-- END -->
~~~

- _config.yml：设置一些全局变量，通过 `site.变量名` 访问；设置一些参数。下面是一些例子

设置：

~~~
title: My Blog
~~~

变量，之后可通过 `site.title` 得到 "My Blog"

设置：

~~~
authors:
  - Mensu:
      - name: Mensu
        email: yxshw55@qq.com
        website: http://mensu.github.io
        github: Mensu
        weibo: yxshw55
        twitter: mensuhamesu
~~~
  
数据结构，通过 `site.authors.Mensu.name` 得到 "Mensu"。或者在 for 循环

~~~
{% raw %}{% for item in site.authors.Mensu %}
  {{ item.email }}
{% endfor %}{% endraw %}
~~~

中，通过 `item.email` 获得 "yxshw55@qq.com"

具体参见 [jekyllrb.com/docs/variables](https://jekyllrb.com/docs/variables/)

此外，还有一些推荐设置

~~~
markdown: kramdown
kramdown:
  input: GFM
  syntax_highlighter: rouge
~~~

第一行 指定使用 Github 默认的 Markdown 解释器 kramdown  
第三行 `input: GFM` 指定使用 Github Flavored Markdown  
第四行 `syntax_highlighter: rouge` 指定使用 Github 默认的语法高亮器

~~~
gems: [jekyll-paginate]
paginate: 5
~~~

用 paginate 可以实现显示文章列表、文章摘要等功能。具体参见 [jekyllrb.com/docs/pagination](https://jekyllrb.com/docs/pagination/)

