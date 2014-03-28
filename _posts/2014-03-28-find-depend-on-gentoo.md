---
layout: post
title: "Gentoo 中打包确定依赖"
description: "在 Gentoo 中打包时如何确定依赖"
keywords: "Gentoo, 依赖"
category: Linux
tags: [Gentoo]
---
{% include JB/setup %}

看到 Mxthon 发布了 Linux 版本，Gentoo 同学速度很快，ebuild 已经提交到 Gentoo-zh 中，不过为了验证依赖是否全部满足，临时写了个脚本去验证

几步走：

1. 下载二进制包，解压
2. `ldd file`，确定需要的库文件
3. 取第一结果，排序，去除重复数据
4. `equery b name.so` 参数确定需要的软件包

<!-- more -->
很简单，当然 `equery b file` 是在线查询，需要耗费些时间

```bash
exefile=$1

for so in $(ldd ${exefile} | awk '{print $1}' | sort | uniq ); do
    [[ ! -f $so ]] && echo $so >> /tmp/${exefile}.so;
done

for so in $(cat /tmp/${exefile}.so); do
    echo "$so need:"; equery b $so >> /tmp/${exefile}.so.result;
done

rm /tmp/${exefile}.so
```

临时写的，上班后修正
