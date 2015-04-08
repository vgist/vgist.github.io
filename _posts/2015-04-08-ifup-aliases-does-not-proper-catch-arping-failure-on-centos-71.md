---
layout: post
title: "OpenVZ 在 CentOS 7.1 下的网络问题"
category: Linux
tags: [OpenVZ]
---

前几天手痒，yum update -y 后，看到那么多的更新包，想了下还是重启好了，结果...

基于 OpenVZ 容器的虚拟机，均在升级到 CentOS 7.1 时出现了网络问题。N 多人忙着进 Serial Console 去备份，随后，要么重装系统，要么回滚 initscripts 至 9.49.17...

我也是，提交了工单后，客服帮忙 `ifup venet0:0` 执行两次后取得网络。

<!-- more -->
有关于此的 bugzilla：

<https://bugzilla.redhat.com/show_bug.cgi?id=1207975>

心急的同学可以按照上游的 [patch](https://git.fedorahosted.org/cgit/initscripts.git/patch/?id=55a50ebc591ebd0f4cfbb8ecc204fa20ee6a7368) 直接去修改 **ifup-aliases** 以防重启后网络失败

```
From 55a50ebc591ebd0f4cfbb8ecc204fa20ee6a7368 Mon Sep 17 00:00:00 2001
From: Lukas Nykryn <lnykryn@redhat.com>
Date: Sun, 5 Apr 2015 15:43:15 +0200
Subject: ifup-aliases: don't return with error when arping fails


diff --git a/sysconfig/network-scripts/ifup-aliases b/sysconfig/network-scripts/ifup-aliases
index e66cb81..2989b8d 100755
--- a/sysconfig/network-scripts/ifup-aliases
+++ b/sysconfig/network-scripts/ifup-aliases
@@ -267,7 +267,8 @@ function new_interface ()
                is_available ${parent_device} && \
                ( grep -qswi "up" /sys/class/net/${parent_device}/operstate ||  grep -qswi "1" /sys/class/net/${parent_device}/carrier ) ; then
                    echo $"Determining if ip address ${IPADDR} is already in use for device ${parent_device}..."
-				   if ! /sbin/arping -q -c 2 -w ${ARPING_WAIT:-3} -D -I ${parent_device} ${IPADDR} ; then
+				   /sbin/arping -q -c 2 -w ${ARPING_WAIT:-3} -D -I ${parent_device} ${IPADDR}
+				   if [ $? = 1 ]; then
 					   net_log $"Error, some other host already uses address ${IPADDR}."
 					   return 1
 				   fi
-- 
cgit v0.10.2
```
