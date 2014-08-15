---
layout: post
title: "Nginx 502 Bad Gateway 处理"
description: "Nginx 502 Bad Gateway 处理"
keywords: nginx, 502, bad gateway
category: Internet
tags: [Nginx]
---

一般 `nginx` 搭配 `php` 都采用这样的方式：

```nginx
location ~ \.php$ {
    proxy_pass http://localhost:9000;
    fastcgi_param SCRIPT_FILENAME /data/_hongdou$fastcgi_script_name;
    include fastcgi_params;
}
```

<!-- more -->
这个方式只能连接到一组 `spawn-fcgi` 开启的 `fastcgi`，在服务器负载稍高时常常出现 `502 bad gateway` 错误。

起先怀疑这是 `php-cgi` 的进程开得太少，增加后仍然有反映时常有错，偶然间发现 `php-cgi` 会报出这样的错误：

    zend_mm_heap corrupted

看来是 `php-cgi` 在执行某些代码时有问题，以致于该线程中止。

在服务器上可能还会看到 `php-cgi` 进程在不断变少，估计是出现错误的 `php-cgi` 的进程自动退出了。

`php` 的问题总是不太容易能解决，所以在 `nginx` 方面想想办法，`nginx` 的好处是它总是能爆出一些稀奇古怪的做法出来。

在 `nginx` 的 `proxy` 中，规避莫名其妙错误的办法无非是 `proxy` 到一个 `upstream` 的服务器组中，然后配置 `proxy_next_upstream`，让 `nginx` 遇到某种错误码时，自动跳到下一个后端上。这样，应用服务器即使不稳定，但是在 `nginx` 后面就变成了稳定服务。想到 `nginx` 的 `fastcgi` 和 `proxy` 是一路东西，所以 `proxy` 能用的经验，移植到 `fastcgi` 也能跑得起来。

照着这个思路，用 `spawn-fcgi` 多开同样一组 `php` 进程，所不同的仅仅是端口：

    spawn-fcgi -a 127.0.0.1 -p 9000 -u nobody -f php-cgi -C 100
    spawn-fcgi -a 127.0.0.1 -p 9001 -u nobody -f php-cgi -C 100

然后把 `fastcgi` 的这段配置改成用 `upstream` 的方式：

```nginx
upstream backend {
    server 127.0.0.1:9000;
    server 127.0.0.1:9001;
}
location ~ \.php$ {
    fastcgi_pass backend;
    fastcgi_param SCRIPT_FILENAME /data/_hongdou$fastcgi_script_name;
    include fastcgi_params;
}
```

检查配置结果正确，能跑起来；同时在服务器上 `netstat -n|grep 9000` 和 `grep 9001` 都有记录，证明连接无误；在前台查阅页面，一切运行正常。

这个配置是最简单的配置，既然能连接上 `upstream`，那么很显然 `upstream` 的一些东西都可以拿来用，比如 `ip_hash`、`weight`、`max_fails`等。

这样的配置在单机下不知能不能共享 `session`，没有测试，如果有问题，可以加上 `ip_hash`，或者配置 `php` 把 `session` 存进 `memcached` 中。

然后就是 `fastcgi_next_upstream` 的配置，`nginx wiki` 中没有介绍到这个配置，查了一下，在 `nginx` 的 `CHANGES` 中有提到，而且出生年月是和 `proxy_next_upstream` 一样的。既然如此，那就照 `proxy_next_upstream` 一样配吧。一般按默认的值 `error timeout` 就可以工作，因为 `php` 出现 502 错误的异常是返回的 500 错误，所以我把 `fastcgi_next_upstream` 定为：

    fastcgi_next_upstream error timeout invalid_header http_500;

通过这个配置，就可以基本杜绝任何时常性的 500 错误，出问题的几率会变小很多，如果客户反映仍然激烈，那么就多增加几组 `fastcgi` 进程。

以上配置能够杜绝由于 `php` 所引起的“莫名其妙”的时常性的 502 错误，同时可使 `nginx` 搭配 `php` 比从前方式更为强悍。假如 `nginx` 还是返回 502 错误，那这次就一定是出现服务器挂掉或其它严重问题的了。
