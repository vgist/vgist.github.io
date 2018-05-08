---
layout: post
title: "CentOS 7 下使用 tmpfs"
category: Linux
tags: [tmpfs, CentOS]
---

大家对于 tmpfs 都不会陌生，相关的介绍也很多。tmpfs 有着显著的优缺点，优点就是速度，因为存储在内存之中，速度非常快。缺点就是，当 tmpfs 被卸载、系统重启或者电源被切断，tmpfs 中所有的内容会消失。在 CentOS 7 中，也有 tmpfs 的一些应用。通过 `df -Th` 我们可以看到：

```
Filesystem     Type      Size  Used Avail Use% Mounted on
devtmpfs       devtmpfs  2.0G     0  2.0G   0% /dev
tmpfs          tmpfs     2.0G     0  2.0G   0% /dev/shm
tmpfs          tmpfs     2.0G  648K  2.0G   1% /run
tmpfs          tmpfs     2.0G     0  2.0G   0% /sys/fs/cgroup
/dev/vda1      ext4       20G  4.8G   14G  26% /
tmpfs          tmpfs     395M     0  395M   0% /run/user/1000
```

默认状态下， CentOS 7 并没有挂载 tmpfs 到 /tmp 上，通过以下命令查看：

    systemctl is-enabled tmp.mount

需要自己手动操作一下

    systemctl enable tmp.mount

我们当然也可以使用传统的方式来挂载，譬如在 `/etc/fstab` 中指定

    tmpfs   /tmpfs  tmpfs   size=512m   0 0

如果想要调整当前 tmpfs 的大小，可以如此操作

    mount -o remount,size=N /tmp

很简单，详细的使用方法，可以 `man mount`。
