---
layout: post
title: "GitHub Pages 配置域名"
description: "User Pages 与 Project Pages 域名域名配置的区别"
keywords: "github, user pages, project pages, domain, 域名"
category: Internet
tags: [Github, Domain]
---
{% include JB/setup %}

最近为 [zhlist](http://github.com/zhlist/zhlist)的 gh-pages branch 分支配置了个域名。仔细的阅读了[这篇文章](https://help.github.com/articles/setting-up-a-custom-domain-with-pages)，终于搞清了 **User Pages** 与 **Project Pages** 的区别。

- User Pages 下，CNAME 是放置在 master 分支下。
- Project Pages 下，CNAME 是放置在 gh-pages 分支下。

<!-- more -->
在同时拥有 User Pages、Project Pages 情况下，http://username.github.io/projectname 将不会转向到 Project Pages 中 gh-pages 分支下设置的域名。而会以 User Pages 中 master 分支下设置的域名，加上 `/projectname` 路径来体现

譬如 http://github.com/zhlist/zhlist.github.io 配置域名 zhlist.org，那么 http://github.com/zhlist/project 的访问 URL 则为 http://zhlist.org/project。
