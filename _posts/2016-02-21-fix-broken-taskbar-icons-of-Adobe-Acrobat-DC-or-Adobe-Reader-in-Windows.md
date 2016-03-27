---
layout: post
title: "Adobe Acrobat DC/Adobe Reader任务栏图标出错、异常、不显示 (Windows下)"
description: "如何处理Windows下Adobe产品任务栏图标异常"
subtitle: "fix broken taskbar icons of Adobe products in Windows"
create-date: 2016-02-21
update-date: 2016-03-27
header-img: ""
author: "Mensu"
tags:
    - 电脑经验
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%-d" }}**.

# 要做的是删除图标缓存：

以管理员身份运行 cmd ，*具体方法见文末

复制粘贴以下命令，回车  
有些 Windows 系统 cmd 下粘贴需要在 cmd 中右键 - 粘贴

~~~
cd /d "%userprofile%\AppData\Local"
attrib –h "IconCache.db"
del "IconCache.db"
~~~
![copy commands above before pressing enter](http://7xrahq.com1.z0.glb.clouddn.com/fix-broken-icon-Adobe-copy-commands-above-before-pressing-enter.png)

 - `cd /d "目标路径"` 的意思是进入目标路径。cd是命令，加上/d是为了保证能从现在路径的硬盘进入目标路径的硬盘
 - 加引号是为了告诉电脑这是一个整体（字符串）。*加引号是为了防止文件名里面的空格被电脑误会为隔开两个参数的分隔符*
 - `%xxx%` 的意思是一个变量，这里%userprofile%代表着当前账户的文件夹地址，相当于 `C:\Users\账户名`
 - `attrib –h "文件"` 的意思是去掉文件的隐藏属性。-h减掉hide属性。相反 +h 就是把文件设置为隐藏了
 - `del "文件"` 的意思是删除该文件

最后重启Windows资源管理器*

开始菜单里的图标出错，可以考虑重新创建一个快捷方式替换，然后重启Windows资源管理器

# 图解

## 打开任务管理器

  右键任务栏，任务管理器，或按下组合键 Ctrl + Shift + Esc
  
  ![launch task manager](http://7xrahq.com1.z0.glb.clouddn.com/fix-broken-icon-Adobe-launch-task-manager.png)

## 以管理员身份运行cmd

A. 可以搜索cmd，右键以管理员身份运行
  
B. 也可以右键开始图标，选择命令提示符(管理员)

![launch cmd as an administrator](http://7xrahq.com1.z0.glb.clouddn.com/fix-broken-icon-Adobe-launch-cmd-as-administrator.png)
C. 也可以在附件之类的地方找到命令提示符，右键以管理员身份运行

D. 还可以打开任务管理器，运行cmd，记得选中以管理员身份

## 重启Windows资源管理器

A. 可以打开我的电脑和任务管理器，右键Windows资源管理器，重新启动
  
B. 也可以打开我的电脑和任务管理器，右键Windows资源管理器，结束任务，再运行explorer

![restart Windows system resource manager](http://7xrahq.com1.z0.glb.clouddn.com/fix-broken-icon-Adobe-restart-windows-system-resource-manager.png)

## 替换更新开始菜单里的快捷方式
1, 右键要更新的项目，打开文件所在位置，记作文件夹A
  
2 A. 再在文件夹A中右键该项目打开文件所在位置
    
&nbsp;&nbsp;&nbsp;B. 或右键属性-打开文件位置
   
3, 右键要更新的项目，发送到桌面快捷方式

4, 重命名桌面的那个快捷方式，拖至文件夹A覆盖，或者复制桌面的那个快捷方式，在文件夹A中粘贴，覆盖
   
![update shortcut's icon on start menu](http://7xrahq.com1.z0.glb.clouddn.com/fix-broken-icon-Adobe-update-shortcut-s-icon-on-start-menu.png)