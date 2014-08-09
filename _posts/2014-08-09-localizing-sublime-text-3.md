---
layout: post
title: "Sublime Text 中文化"
description: "昨晚摸索了下 Sublime Text 3 的一些功能，明确了一些基本的功能，参考了各方面的资料，于是动起了汉化 Sublime Text 的念头"
keywords: "sublime, sublime text, 汉化, 中文"
category: Other
tags: []
---
{% include JB/setup %}

昨晚摸索了下 Sublime Text 的一些功能，明确了一些基本的功能，参考了各方面的资料，于是动起了汉化 Sublime Text 的念头。

![localizing Sublime Text 3]({{ site.qiniudn }}/images/08/09/localizing-sublime-text-3.png)

<!-- more -->
网上溜达一圈，发现，原来已有前人早做了工作，只是个别用语不符合我的习惯。修改下，放 github 上以集众人智慧来完善 Sublime Text 的中文化。

- 首先去 [https://github.com/Ihavee/st3-zh_CN/releases/latest](https://github.com/Ihavee/st3-zh_CN/releases/latest) 下载最新的 `Default.sublime-package` 两禁止文件
- 运行 Sublime Text，点击 Preferences -- Browse Packages，会打开 Packages 目录
- 将 Default.sublime-package 移动到 Packages 同层的 Install Packages 目录下即可

Github: [https://github.com/Ihavee/st3-zh_CN](https://github.com/Ihavee/st3-zh_CN)

当然如果大家有兴趣一次参与完善，可以打开上面连接，clone 到本地，翻译所有 `*.sublime-menu` 文件，里面肯定存在不正确的常用语。

翻译完成后，Linux 与 OS X 用户，打包成两进制 *.sublime-package 的方法：

    zip -x ".git" -rX9 Default.sublime-package st3-zh_CN

最后，感谢 [朽木汉化](http://www.xiumu.org/technology/sublime-text-hand-finished-method.shtml)。
