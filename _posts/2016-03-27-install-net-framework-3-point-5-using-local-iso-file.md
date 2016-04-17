---
layout: post
title: "用本地 Windows 镜像文件安装 .NET Framework 3.5"
description: ""
subtitle: "install .NET Framework 3.5 using local iso files on Windows"
create-date: 2016-03-27
update-date: 2016-03-29
header-img: ""
author: "Mensu"
tags:
    - 电脑经验
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%-d" }}**.

## 问题

无法通过 Windows Update 安装 .NET Framework 3.5, 表现如下：

![attempt to download and install .NET Framework 3.5](http://7xrahq.com1.z0.glb.clouddn.com/install-net-framework-3-point-5-attempt-to-download-and-install-net-framework-3-point-5.png)
[上图来源](http://bbs.pcbeta.com/viewthread-1413582-1-1.html){:target="_blank"}

![fail to install .NET Framework 3.5 with error code 0x800F081F](http://7xrahq.com1.z0.glb.clouddn.com/install-net-framework-3-point-5-fail-to-install-net-framework-3-point-5-with-error-code-0x800F081F.jpg)
[上图来源](http://zhidao.baidu.com/question/516655900.html){:target="_blank"}

## 解决办法

找到安装本系统用的光盘文件，装载

![load the iso file used to install your Windows](http://7xrahq.com1.z0.glb.clouddn.com/install-net-framework-3-point-5-load-iso-file.png)

如果找不到，可以考虑到 [MSDN，我告诉你](http://msdn.itellyou.cn){:target="_blank"} 下载

![download Windows 10 iso file at http://msdn.itellyou.cn](http://7xrahq.com1.z0.glb.clouddn.com/install-net-framework-3-point-5-download-windows-10-iso-file-at-msdn.png)

接下来以管理员身份运行 cmd ，*具体方法见文末

复制粘贴以下命令，回车，稍等几秒，等待安装即可  
有些 Windows 系统 cmd 下粘贴 需要在 cmd 中右键 - 粘贴

~~~
Dism /online /enable-feature /featurename:NetFx3 /LimitAccess /All /Source:g:\sources\sxs
 
~~~

其中 g 为镜像装载后的盘符

![copy commands above before pressing enter](http://7xrahq.com1.z0.glb.clouddn.com/install-net-framework-3-point-5-copy-commands-above.png)

- `Dism` 是我们要用的程序的名字，全称 “部署映像服务和管理工具”
- `/Online` 的意思是安装对象为本机
- `/enable-Feature /featureName:NetFx3` 的意思是安装 .NET Framework 3.5
- `/LimitAccess` 的意思是不连接到 WU (Windows Update) 或 WSUS (Windows Server Update Services)
- `/All` 的意思是启用 .NET Framework 3.5 的上级功能
- `/Source:g:\sources\sxs` 指定安装源。当然我们也可以把 `g:\sources\sxs` 下的东西复制到本地的 xx 文件夹，再指定 xx 文件夹作为安装源

---

### 以管理员身份运行cmd

A. 可以搜索cmd，右键以管理员身份运行
  
B. 也可以右键开始图标，选择命令提示符(管理员)

![launch cmd as an administrator](http://7xrahq.com1.z0.glb.clouddn.com/fix-broken-icon-Adobe-launch-cmd-as-administrator.png)
C. 也可以在附件之类的地方找到命令提示符，右键以管理员身份运行

D. 还可以打开任务管理器，运行cmd，记得选中以管理员身份