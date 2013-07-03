---
layout: post
title: "天气预报的超短 Shell"
description: "天气预报的超短 Shell"
keywords: shell, 天气预报
category: Linux
tags: [CLI, weather]
---
{% include JB/setup %}

![Weather](/assets/images/2011/08/11.png "weather")

保存为weather.sh

    chmod +x weather.sh

然后 `./weather.sh` 上海

即能得到上海近两天的天气预报

    #!/bin/bash
    w3m -dump "http://wap.youdao.com/weather?memlocation=1&q=$1" 2>/dev/null | sed '2,5!d'

