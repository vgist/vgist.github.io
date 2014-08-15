---
layout: post
title: "天气预报的超短 Shell"
description: "天气预报的超短 Shell"
keywords: shell, 天气预报
category: Linux
tags: [CLI, Weather]
---

![Weather]({{ site.qiniudn }}/images/2011/08/11.png "weather")

保存为weather.sh

    chmod +x weather.sh

<!-- more -->
然后 `./weather.sh` 上海

即能得到上海近两天的天气预报

    #!/bin/bash
    w3m -dump "http://wap.baidu.com/s?word=$1&ssid=0&from=0&bd_page_type=1&ct_6=天气查询" 2>/dev/null | sed '2,5!d'

