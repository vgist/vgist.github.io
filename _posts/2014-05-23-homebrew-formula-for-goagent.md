---
layout: post
title: "Homebrew 脚本 GoAgent"
description: "Mac OS X 下的 GoAgentX 不太好用，也比较吃资源。况且一般情况下，GoAgent 在我电脑上基本是以服务运行的。今天下午翻了下 Homebrew 的开发说明，自己照着写了个 GoAgent 安装脚本。"
keywords: "goagent, homebrew, brew, osx"
category: MAC
tags: [goagent, Homebrew]
---

Mac OS X 下的 GoAgentX 不太好用，也比较吃资源。况且一般情况下，GoAgent 在我电脑上基本是以服务运行的。今天下午翻了下 Homebrew 的开发说明，自己照着写了个 GoAgent 安装脚本。

用法：

    $ brew tap Ihavee/havee
    $ brew install goagent

<!-- more -->
Homebrew 扩展阅读：[Homebrew 的安装与使用]({% post_url 2013-12-21-how-to-install-and-use-homebrew %})

安装完成后，按照说明

    $ ln -sfv /usr/local/opt/goagent/*.plist ~/Library/LaunchAgents/

编辑文件，填入你 GAE 的 appid 与 密码

    $ vim /usr/local/etc/goagent

为了方便后面使用，可以使用 aliases

    $ echo "alias goagent.start='launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.goagent.plist'" >> ~/.bashrc
    $ echo "alias goagent.stop='launchctl unload -w ~/Library/LaunchAgents/homebrew.mxcl.goagent.plist'" >> ~/.bashrc
    $ echo "alias goagent.restart='goagent.stop && goagent.start'" >> ~/.bashrc

使用时就可以方便的使用命令行

    $ goagent.start
    $ goagent.stop
    $ goagent.restart

Safari 以及 google chrome 用户，请直接输入以下命令安装证书

    $ sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" "/usr/local/opt/goagent/local/CA.crt"

以前导入过证书的同学，确保将原 GoAgent 证书删除后，再执行上面的命令，如下图所示

![KeyChain]({{ site.qiniudn }}/images/2014/05/keychain.png)

Mozilla Firefox 用户，请使用 Firefox 自身的证书管理导入证书

    首选项 —— 高级 —— 证书 —— 查看证书 —— 证书机构 —— 导入

同样，以前导入过的同学，确保将原证书删除后，再导入

![Cert Manage]({{ site.qiniudn }}/images/2014/05/cert-manage.png)

最后设下 Homebrew 安装的 Python 模块路径变量

    $ echo '/usr/local/lib/python2.7/site-packages' > ~/Library/Python/2.7/lib/python/site-packages/homebrew.pth

查看 log 可以

    $ tail -f /usr/local/var/log/goagent.log

![GoAgent Log]({{ site.qiniudn }}/images/2014/05/goagent-log.png)

源码地址：[https://github.com/Ihavee/homebrew-havee](https://github.com/Ihavee/homebrew-havee)。



**注意**：安装过程中可能会出现错误提示

    clang: error: unknown argument: '-mno-fused-madd' [-Wunused-command-line-argument-hard-error-in-future]

这是 Xcode 5.1 开始，编译器 LLVM 规定对未知参数的传入，视为错误。解决方法是：

    $ echo "export ARCHFLAGS=-Wno-error=unused-command-line-argument-hard-error-in-future" >> ~/.bashrc

pip 扩展阅读：[OS X 上的 pip 使用 User Installs]({% post_url 2014-05-04-individual-scheme-for-pip %})

参考：[https://github.com/Homebrew/homebrew/wiki/Formula-Cookbook](https://github.com/Homebrew/homebrew/wiki/Formula-Cookbook)
