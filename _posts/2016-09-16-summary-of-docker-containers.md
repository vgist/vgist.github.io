---
layout: post
title: "Docker 容器使用小结"
category: Linux
tags: [Docker]
---

目前也已经将生产环境中所有服务运行在 Docker 容器中，从一年前就一直想写一篇有关 Docker 的文章，可是年初以来一直没有时间，趁着这个中秋节假期，终于开始着笔。

#### 介绍

Docker 是一个开源的应用容器引擎，使用轻量级的容器虚拟化技术，开发者可以方便的打包他们的应用以及依赖包到一个可移植的容器中，来发布到任何流行的 Linux 发行版上。

- 命名空间： Docker 引擎采用 namespaces 来提供一个隔离的工作区，通过 kernel 的 pid、net、ipc、mnt、uts 等 namespaces 实现对进程、网络、消息、文件系统与内核版本的隔离。
- 资源配置：通过 cgroups 来控制容器的硬件资源。
- 文件系统：利用 UnionFS，通过创建图层来实现对容器的轻量与快速更新。Docker 引擎可以使用多个 UnionFS 的变种，包括 AUFS、btrfs、vfs 与 DeviceMapper。
- 容器格式：Docker 引擎结合 namespaces、cgroups、UnionFS 一起组成 libcontainer 容器格式，将来或许会支持更多的譬如 BSD Jails、Solaris Zones 容器格式。

Docker 已经成熟并被大量的应用到生产环境，所以概念部分就不阐述了，针对与 Virtual Machines 的区别说一下。

<!-- more -->

Docker 的出现，并非是为了取代 Virtual Machine，前者是为了 devops，后者则是为了统一开发环境。Docker 是一个容器，底层的实现是利用下层操作系统内核提供的功能，是进程级别的。而 VM 则是完全的虚拟化，底层则基本是虚拟机，下图是一个极简的对比图。

![Docker VS VM](https://cdn.09hd.com/images/2010/09/docker-vs-vm.png)

#### 使用方法

很多人对概念部分不感冒，还是让我们直接进入使用环节，详细的参数，可以通过 `docker COMMAND --help` 来获取详细信息。

##### 安装

- Linux: 使用各发行版的包管理工具即可安装
- Mac: Docker for Mac
- Windows: Docker for Windows

##### 运行

我们在 Docker 容器中运行一个 echo 试试，首先拉取一个远程的 apline 镜像，其次容器中输出 "Hello World!"。

    docker pull alpine
    docker run -it apline echo "Hello World!"

是的，一个基于 Alpine 的镜像按照你的命令输出了 "Hello World"。我们查看下本地现有的镜像：

    $ docker images -a
    REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
    alpine              latest              4e38e38c8ce0        12 weeks ago        4.799 MB

查看下本地现有的 Docker 进程：

    $ docker ps -a
    CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS                     PORTS               NAMES
    aaa36d3bc66e        alpine              "echo 'Hello World'"   4 seconds ago       Exited (0) 2 seconds ago                       distracted_meitner

我们销毁该进程后，再查看下：

    $ docker rm aaa36d3bc66e
    aaa36d3bc66e
    $ docker ps -a
    CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES

我们如何进入容器中呢，譬如查看下镜像的内核与版本，然后退出并销毁该进程：

    $ docker run -it alpine sh
    / # uname -a
    Linux f35ec3b5e253 4.4.15-moby #1 SMP Thu Jul 28 22:03:07 UTC 2016 x86_64 Linux
    / # cat /etc/alpine-release
    3.4.0
    / # exit
    $ docker ps -a
    CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
    c50ffeb5a709        alpine              "sh"                12 seconds ago      Exited (0) 1 seconds ago                       berserk_blackwell
    $ docker rm c50ffeb5a709
    c50ffeb5a709

我们把镜像也删除了吧：

    $ docker rmi 4e38e38c8ce0
    Untagged: alpine:latest
    Untagged: alpine@sha256:3dcdb92d7432d56604d4545cbd324b14e647b313626d99b889d0626de158f73a
    Deleted: sha256:4e38e38c8ce0b8d9041a9c4fefe786631d1416225e13b0bfe8cfa2321aec4bba
    Deleted: sha256:4fe15f8d0ae69e169824f25f1d4da3015a48feeeeebb265cd2e328e15c6a869f

到这里，可以仔细观察下， container id 与 image id 的区别。

一般情况下，我们以 backgroud 运行一个容器，有时需要 attach 进容器进行一些操作，我们以 gists/nginx:stable 为例：

    $ docker run --name my-nginx -d gists/nginx:stable
    Unable to find image 'gists/nginx:stable' locally
    stable: Pulling from gists/nginx
    e110a4a17941: Pull complete
    617dca60f103: Pull complete
    b397f6ce6faa: Pull complete
    09010597eddf: Pull complete
    8ee5e0c70a8d: Pull complete
    Digest: sha256:f8ed78c176be524fdb3e4193d6b6d36126745ab950b8f5e9d62186e598bd2660
    Status: Downloaded newer image for gists/nginx:stable
    72073c6d85cf3904201ccaff5fc9eb70525b5f57d010f43961047f4f03fb922b
    $ docker exec -it my-nginx sh
    / #
    / # top
    Mem: 341868K used, 1706792K free, 183572K shrd, 8692K buff, 190432K cached
    CPU:   0% usr   0% sys   0% nic 100% idle   0% io   0% irq   0% sirq
    Load average: 0.00 0.00 0.00 2/150 13
      PID  PPID USER     STAT   VSZ %VSZ CPU %CPU COMMAND
        6     1 nobody   S    34260   2%   1   0% nginx: worker process
        5     1 nobody   S    34260   2%   1   0% nginx: worker process
        1     0 root     S    13444   1%   0   0% nginx: master process nginx -g daemon off;
        7     0 root     S     1524   0%   1   0% sh
       13     7 root     R     1516   0%   1   0% top
    / # exit
    $

#### 构建镜像

还是让我们直接以 Dockerfile 来入门讲解：

    FROM <image>:<tag>
    MAINTAINER <name>

    ENV <key> <value>

    RUN command

    COPY <src> <dest>

    EXPOSE <port>

    VOLUME ["/path/to/dir"]

    USER <username>

    WORKDIR /path/to/dir

    CMD yourcommand

- FROM：Dockerfile 文件的第一条指令，当前镜像构建于哪个镜像，现在一般以 apline 即基础镜像。
- MAINTAINER：指定维护者信息。
- ENV：环境变量，被后续 RUN 等指令使用，并在容器运行时保持。
- RUN：构建镜像的详细指令，每多一条 RUN 指令即多一层 layer。
- COPY：复制 Dockerfile 文件所在目录中的文件或目录到容器中。
- ADD：复制 Dockerfile 所在目录中的文件到容器中，也可以是一个 URL，还可以自动解压 tar。
- EXPOSE：指定暴露给 Host 的端口号，可以如下几种形式，第三种是指定端口范围：
    - EXPOSE port1 port2
    - EXPOSE port1/tcp port2/udp
    - EXPOSE port1:port2
- VOLUME：创建一个可以从本地主机或其他容器挂载的挂载点，一般用来存放数据库和需要保持的数据等。
- USER：指定运行容器时的用户名或 UID，后续的 RUN 也会使用指定用户。当服务不需要管理员权限时，可以通过该命令指定运行用户。
- WORKDIR：为后续的指令指定工作目录。
- ENTRYPOINT：指定容器启动后的命令，不可被 docker run 提供的参数覆盖，有两种格式：
    - ENTRYPOINT ["executable", "param1", "param2"]
    - ENTRYPOINT command param1 param2
- CMD：指定容器服务运行时的命令，有三种格式：
    - CMD ["executable","param1","param2"]
    - CMD command param1 param2
    - CMD ["param1","param2"] 提供给 ENTRYPOINT 的默认参数

最后通过在 Dockerfile 目录执行 `docker build .` 来构建镜像。

说到这里，提一下我构建镜像的方法，我现在基本是以 Alpine Linux 为基础镜像，`docker run -it --name test alpine:3.4 sh` 进入交互模式，将需要安装的服务在 shell 下一步一步去安装去配置，一切顺利后，再将步骤写入 Dockerfile 的 RUN 指令中。再 `docker build .` 与 `docker run ..` 跑一遍，确认无误后，才会 push，最后通过 docker hub 的自动构建镜像。

未完待续......

参考：<https://docs.docker.com>
