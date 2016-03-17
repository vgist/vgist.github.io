---
layout: post
title: "Nginx 反向代理 Google"
category: Linux
tags: [Nginx, Proxy, Google]
---

自己编译，无法通过包管理器去安装，去清理，简直就是洁癖杀手，于是也就有了这篇文章了。

去年有介绍过通过 Nginx 来做 [域名反向代理]({% post_url  2013-07-27-reverse-proxy-domain %})，12 月 17 日，wen.lu 的作者开源了一个模块 [ngx\_http\_google\_filter\_module](https://github.com/cuber/ngx_http_google_filter_module)，让大家方便的反向代理 Google。

今天我整理了一下，介绍下在 CentOS 下如何方便的打包包含该模块的方法。

首先环境配置下

    $ echo "%_topdir %(echo $HOME)/rpmbuild" >> ~/.rpmmacros
    $ mkdir -p ~/rpmbuild/{BUILD,RPMS,S{OURCE,PEC,RPM}S}
    $ sudo yum install rpm-build rpmdevtools

<!-- more -->

我已经将打包所需文件 push 到 [github](https://github.com/Ihavee/ihavee-rpm/tree/master/nginx) 上，可以直接 clone 下来。

    $ git clone git://github.com/Ihavee/ihavee-rpm.git /path/to/ihavee-rpm

将 `/path/to/ihavee-rpm/nginx` 下除 **nginx.spec** 外的所有文件，移动到 `~/rpmbuild/SOURCES` 下，随后执行 `spectool` 将 Nginx 以及两个 module 的源码包下载下来。

    $ spectool -R -g /path/to/ihavee-rpm/nginx.spec

最后就执行打包操作了

    $ rpmbuild -ba /path/to/ihavee-rpm/nginx.spec

完成后的两进制包存在于 `~/rpmbuild/RPMS` 下，可以通过 `sudo rpm -ivh ...` 或 `sudo yum install ...` 来安装。

然后享受简单配置下即可运行

```nginx
server {
    listen 80;
    server_name your.domain;

    keepalive_timeout 60;
    resolver 8.8.8.8;

    location / {
        google on;
    }
}
```

当然建议还是给自己的域名配个 ssl 证书，防止一些关键字触发防火墙。

```nginx
server {
    listen 443 ssl;
    listen 80;
    server_name your.domain;

    ssl on;
    ssl_certificate /path/to/your.domain.crt;
    ssl_certificate_key /path/to/your.domain.key;

    keepalive_time 60;
    resolver 8.8.8.8;

    location / {
        google on;
    }

    error_page 497 https://$server_name$$request_uri;
}
```

有关 ssl 的更详细的配置可以查阅：[《服务端 SSL 配置》]({% post_url 2015-06-10-strong-ssl-security-for-apache-nginx-lighttpd %})
