---
layout: post
title: "Jekyll 使用七牛同步工具"
description: "在 Jekyll 中使用七牛镜像"
keywords: "jekyll, qiniu, 七牛"
category: Internet
tags: [Jekyll, Usage]
---

今天有些空闲，遂研究了下，如何将 Jekyll 博客下的图片同步至七牛。为什么要用七牛，因为七牛尽管不是免费的产品，但是它很热心的给用户提供了免费的配合。

- 存储空间 10GB
- 每月流量 10GB
- 每月 put/delete 100k 次请求
- 每月 get 1000k 次请求

<!-- more -->
好吧，作为一个个人博客来说，足够使用。再加上几个月前七牛工作人员联系上我，希望能写篇有关 Jekyll 上使用七牛的文章，琢磨着过去好久了，于是今天就有了这篇文章。

首先，鄙人使用的工具是七牛提供的：<http://developer.qiniu.com/docs/v6/tools/qrsync.html#download>。根据各自平台去下载响应的同步工具。

解压开，将 **qrsync** 两进制文件放入你的 Jekyll 根目录下，再在 `.gitignore` 文件中添加 `qrsync`，毕竟，你是不会希望一个 12 MB 大小的两进制包进入你的源代码中吧。如下

    _site
    Thumbs.db
    .DS_Store
    !.gitkeep
    .sass-cache
    qrsync

Jekyll 根目录下创建七牛同步工具的配置文件，json 格式，`touch /path/qiniu.json`

```json
{
    "access_key": "your access key",
    "secret_key": "your secret key",
    "bucket": "bucket name",
    "sync_dir": "local directory to upload",
    "async_ops": "",
    "debug_level": 1
}
```

我是创建了个 **qiniu** 目录用来同步到七牛的。

接着，配置你的 **Rakefile**，没有的话在 Jekyll 根目录新建个文件，有的话，在适当的位置添加如下几行，很简单：

```ruby
desc "use qiniu sync tool to sync qiniu folder to remote server"
task :qrsync do
    system "#{Dir.pwd}/qrsync #{Dir.pwd}/qiniu.json"
end
```

放入一张图片至同步目录，运行一下命令，即可上传至远端

    rake qrsync

以后，写博客，有新加图片的时候，在 push 之前，先 `rake qrsync` 上传下即可。不过我这里测试，配置 `"deletable":    1,` 无效，就是说，本地删除某图片，远端不会删除，真囧。
