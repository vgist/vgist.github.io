---
layout: post
title: "Gentoo 中打包确定依赖"
category: Linux
tags: [Gentoo, Packager]
---

- 通过objdump去获取库信息，过滤
- 再通过 `equery b file` 连网查询，获取软件包名

以 `/bin/cp` 为例

```shell
objdump -p /bin/cp | grep NEEDED | awk '{print $2}' | xargs equery b | sort | uniq
```
