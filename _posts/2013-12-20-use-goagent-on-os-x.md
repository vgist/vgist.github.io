---
layout: post
title: "OS X 上使用 GoAgent"
description: "OS X 上如何使用 GoAgent"
keywords: "goagent, osx"
category: "MAC"
tags: [GoAgent,Proxy]
---

陆陆续续的蚂蚁搬家，将工作机 ArchLinux 下的工具都搬到 Mac OS X 下，proxy 是必不可少的。

在 OS X 下，有两种选择方案

#### 1. 源代码方式

下载最新版的 [GoAgent](https://github.com/goagent/goagent/releases)，解压到你的路径下，编辑好 `proxy.ini` 后，创建一个自启动文件

    touch ~/Library/LaunchAgents/com.goagent.localsrv.plist

填充内容如下

<!-- more -->
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>RunAtLoad</key>
        <true/>
        <key>KeepAlive</key>
        <true/>
        <key>Label</key>
        <string>com.goagent.localsrv</string>
        <key>NetworkState</key>
        <true/>
        <key>ProgramArguments</key>
            <array>
                <string>/usr/bin/python</string>
                <!--以下改为你GoAgent的proxy.py的路径，建议放到自己用户的路径下，这样不会有需要sudo的问题 -->
                <string>/Users/Havee/MyApps/goagent/local/proxy.py</string>
            </array>
        <key>ServiceDescription</key>
        <string>GoAgent Local Service</string>
    </dict>
</plist>
```

自启动命令

    launchctl load -w ~/Library/LaunchAgents/com.goagent.localsrv.plist

移除自启动命令

    Launchctl unload -w ~/Library/LaunchAgents/com.goagent.localsrv.plist

#### 2. 客户端方式

这个就不介绍了，目前可供选择的有 [GoAgentX](https://github.com/ohdarling/GoAgentX)、[BreakWall](https://code.google.com/p/breakwall/)
