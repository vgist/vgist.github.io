---
layout: post
title: "JavaScript 实现域名跳转"
description: ""
keywords: "javascript,重定向"
category: Internet
tags: [JavaScript]
---
{% include JB/setup %}

偶尔发送个博客链接给朋友时，得到的回复基本都是，网页打不开，或者网页打开很慢。由于本博客是托管在 GitHub 上的，内地访问速度一直是问题。之前尝试过在内地配台 vps 用来反向代理。但是成本太高，用了段时间后放弃，重拾去年的 GitCafe，决定把博客迁移到 GitCafe 上。

之前没使用 GitCafe 来托管博客的原因，是其分配的两级域名无法设置301重定向到博客域名上。总所周知，两个域名网站含有一模一样的内容，对 SEO 来说不是好事。今天上午，写了个JavaScript 解决重定向问题。

<!-- more -->
当然，JavaScript 无法实现 301 redirects。这是因为 301 redirects 是需要服务端支持的。而 JavaScript 则是客户端运行的。

开始工作，首先将域名解析到 gitcafe 的 pages ip `117.79.146.98`

```
$ dig havee.me +nostats +nocomments +nocmd

; <<>> DiG 9.8.3-P1 <<>> havee.me +nostats +nocomments +nocmd
;; global options: +cmd
;havee.me.              IN          A
havee.me.       60      IN          A       117.79.146.98
```

JavaScript:

```
<script>
  var url = "havee.me";
  var other = "havee.gitcafe.com";
  if( window.location.host == other ) {
      document.location.href = "\/\/" + url + this.location.pathname;
  }
</script>
```
