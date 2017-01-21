---
layout: post
title: "Systemd 232 导致 Docker container 启动问题"
category: Linux
tags: [Systemd, Docker]
---

#### 问题

近期又一次在 Gentoo 下做了一个升级维护，遇到一个问题，Docker container 死活启动不起来

    $ docker-compose up -d
    Creating redis

    ERROR: for shadowsocks  Cannot start service redis: containerd: container not started
    ERROR: Encountered errors while bringing up the project.

查看日志

```
$ sudo systemctl status docker
● docker.service - Docker Application Container Engine
   Loaded: loaded (/usr/lib/systemd/system/docker.service; disabled; vendor preset: disabled)
   Active: active (running) since Sat 2017-01-21 13:52:27 CST; 7s ago
     Docs: https://docs.docker.com
 Main PID: 16269 (dockerd)
    Tasks: 21 (limit: 4915)
   Memory: 17.8M
      CPU: 400ms
   CGroup: /system.slice/docker.service
           ├─16269 /usr/bin/dockerd -H fd://
           └─16275 docker-containerd -l unix:///var/run/docker/libcontainerd/docker-containerd.sock --metrics-interval=0 --start-timeout 2m --state-dir /var/run/docker/libcontainerd/containerd --shim docker-containerd-shim --runtime docker-runc


Jan 21 13:52:32 Home dockerd[16269]: time="2017-01-21T13:52:32.431087496+08:00" level=warning msg="failed to retrieve docker-init version: unknown output format: tini version 0.13.2\n"
Jan 21 13:52:32 Home dockerd[16269]: time="2017-01-21T13:52:32.823126391+08:00" level=error msg="containerd: start container" error="containerd: container not started" id=a863dc7a53c2ad23020187161f8f782072061550a7834b2a542e7d5a05584e47
Jan 21 13:52:32 Home dockerd[16269]: time="2017-01-21T13:52:32.823493109+08:00" level=error msg="Create container failed with error: containerd: container not started"
Jan 21 13:52:33 Home dockerd[16269]: time="2017-01-21T13:52:33.150447827+08:00" level=error msg="Handler for POST /v1.21/containers/a863dc7a53c2ad23020187161f8f782072061550a7834b2a542e7d5a05584e47/start returned error: containerd: container not started"
```

<!-- more -->

看不出错误，只有一个警告，直接 docker run 看输出

```
$ docker run --rm hello-world
container_linux.go:247: starting container process caused "process_linux.go:359: container init caused \"rootfs_linux.go:53: mounting \\\"cgroup\\\" to rootfs \\\"/var/lib/docker/overlay/700b3203dc8c3f997c72ab6fcb10000b5d9a64401c0ec7524cfb1ca4a7b7a876/merged\\\" at \\\"/sys/fs/cgroup\\\" caused \\\"no subsystem for mount\\\"\""
docker: Error response from daemon: containerd: container not started.

```

OK，找到了

> container init caused "rootfs_linux.go:53: mounting "cgroup" to rootfs "/var/lib/docker/overlay/700b3203dc8c3f997c72ab6fcb10000b5d9a64401c0ec7524cfb1ca4a7b7a876/merged" at /sys/fs/cgroup caused "no subsystem for mount"

以此为关键词，找到问题根源，是最新的 systemd 232，以 cgroup v２ 结构挂载导致 runc 出现错误提示 “no subsystem for mount”，[systemd/systemd#3965](https://github.com/systemd/systemd/pull/3965)。

#### 解决方案

既然根源找到了，那么坚决方案也就明了了。共两种解决方案，任选其一：

- 所有 container 启动时添加一个参数 `-v /sys/fs/cgroup:/sys/fs/cgroup:ro`
- 添加 `systemd.legacy_systemd_cgroup_controller=yes` 到你的 grub2、syslinux 等启动器的内核启动参数中

