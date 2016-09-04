---
layout: post
title: "在 Parallel Desktop 的 Windows 虚拟机下玩 Nexon 游戏"
subtitle: "run Nexon games in Windows virtual machine in Parallel Desktop"
create-date: 2016-09-03
update-date: 2016-09-04
author: "Mensu"
tags:
    - 电脑经验
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

# 问题

刚才受朋友邀请，想重温跑跑卡丁车。没想到在 Parallel Desktop 上的虚拟机安装后，却因被检测出是虚拟机而无法运行游戏

![problem](https://7xrahq.com1.z0.glb.clouddn.com/run-nexon-games-in-windows-virtual-machine-parallel-desktop-problem.png)

# 打开注册表

Parallel Desktop 下还算好解决[^source]。首先打开注册表

A. 可以搜索 ``regedit``，敲下回车打开  
B. 可以通过 ``Win+R`` 打开运行窗口，再输入 ``regedit`` 确定来打开  
C. 可以打开命令提示符，输入 ``regedit`` 敲下回车打开

![open regedit](https://7xrahq.com1.z0.glb.clouddn.com/run-nexon-games-in-windows-virtual-machine-parallel-desktop-open-regedit-1.png)

![open regedit](https://7xrahq.com1.z0.glb.clouddn.com/run-nexon-games-in-windows-virtual-machine-parallel-desktop-open-regedit-2.png)

![open regedit](https://7xrahq.com1.z0.glb.clouddn.com/run-nexon-games-in-windows-virtual-machine-parallel-desktop-open-regedit-3.png)

# 找到 VideoBiosVersion

找到 ``HKEY_LOCAL_MACHINE\HARDWARE\DESCRIPTION\System\`` 目录的 ``VideoBiosVersion``

![find item](https://7xrahq.com1.z0.glb.clouddn.com/run-nexon-games-in-windows-virtual-machine-parallel-desktop-find-item.png)

双击打开，并清空里面的内容（可以先把里面的内容备份起来）

![delete](https://7xrahq.com1.z0.glb.clouddn.com/run-nexon-games-in-windows-virtual-machine-parallel-desktop-delete-1.png)

![delete](https://7xrahq.com1.z0.glb.clouddn.com/run-nexon-games-in-windows-virtual-machine-parallel-desktop-delete-2.png)

然后应该就可以了

![solved](https://7xrahq.com1.z0.glb.clouddn.com/run-nexon-games-in-windows-virtual-machine-parallel-desktop-solved.png)

# 参考文献

[^source]: [应用程序无法在Parallels虚拟机环境下运行_常见问题 - Parallels官方中文服务](https://www.parallelsdesktop.cn/ying-yong-cheng-xu-wf-yx.html){:target="_blank"}
