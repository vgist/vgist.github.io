---
layout: post
title: "Jekyll 使用七牛同步工具"
category: Internet
tags: [Jekyll, Usage]
---

今天有些空闲，遂研究了下，如何将 **Jekyll** 博客下的图片同步至七牛。为什么要用七牛，因为七牛尽管不是免费的产品，但是它很热心的给用户提供了免费的配额。

- 存储空间 10GB
- 每月流量 10GB
- 每月 put/delete 10 万次请求
- 每月 get 100 万次请求

<!-- more -->

好吧，作为一个个人博客来说，足够使用。再加上几个月前七牛工作人员联系上鄙人，希望能写篇有关 **Jekyll** 上使用七牛的文章，琢磨着过去好久了，于是今天就有了这篇文章。

首先，以下所有的前提是：

1. 你有一个 Jekyll 搭建的博客
2. 你有一个七牛的账户

Jekyll 相关的介绍本博客里有，可以直接上方输入框输入 Jekyll 来搜索，七牛的话，可以通过以下注册：<https://portal.qiniu.com/signup?code=3ljaarok4jaz6>，如果对推广链接不爽的话，去掉结尾处的 `?code=3ljaarok4jaz6` 吧。

其次，鄙人使用的工具是七牛提供的：<http://developer.qiniu.com/docs/v6/tools/qrsync.html#download>。根据各自平台去下载响应的同步工具。

解压开，将 **qrsync** 两进制文件放入你的 **Jekyll** 根目录下，再在 **.gitignore** 文件中添加 `qrsync`，毕竟，你是不会希望一个 12 MB 大小的两进制包进入你的源代码中吧（嗯，我第一次就上传了 -_-!!）。如下

    $ cat .gitignore
    _site
    Thumbs.db
    .DS_Store
    !.gitkeep
    .sass-cache
    qrsync
    qiniu.json

鄙人是创建了个 **qiniu** 目录用来同步图片到七牛的。

接着，配置你的 **Rakefile**，没有的话在 **Jekyll** 根目录新建个文件，有的话，在适当的位置添加如下几行，很简单：

```ruby
require "rubygems"
require "rake"

......

desc "synchronize qiniu folder to remote server with qiniu sync tool"
task :qrsync do
  bin = "qrsync"
  json = "qiniu.json"
  ignore = ".gitignore"
  filebin = File.join(Dir.pwd, bin)
  filejson = File.join(Dir.pwd, json)
  fileignore = File.join(Dir.pwd, ignore)

  abort("rake aborted: '#{filebin}' file not found.") unless File.exist?(filebin)

  unless File.exist?(filejson)
    open(filejson, 'w') do |json|
      json.puts '{'
      json.puts '    "access_key": "your access key",'
      json.puts '    "secret_key": "your secret_key",'
      json.puts '    "bucket": "your bucket name",'
      json.puts '    "sync_dir": "local directory to upload",'
      json.puts '    "async_ops": "",'
      json.puts '    "debug_level": 1'
      json.puts '}'
    end
    if File.exist?(fileignore)
      unless File.open(fileignore).each_line.any?{ |line| line.include?(json) }
        open(fileignore, 'a') { |ignore| ignore.puts "#{json}" }
      end
    else
      open(fileignore, 'w') { |ignore| ignore.puts "#{json}" }
    end
    puts "please edit #{filejson}"
  else
    system "#{Dir.pwd}/qrsync #{filejson}"
  end

end
```

随后放入一张图片至你的同步目录，运行以下命令

    $ rake qrsync

第一次运行会创建 **qiniu.json**。编辑好 **qiniu.json** 后第二次运行，如果填写正确，则上传到远端。

如果 **qiniu.json** 中配置的 `sync_dir` 为 `qiniu`

则丢在目录 **qiniu** 中的文件会被上传，需要说明的是，七牛没有目录的概念，不管你在目录 **qiniu**下分几层目录，远端都是单个文件。譬如本地目录类似于：

    qiniu/images/name1.png
    qiniu/images/name2.png
    qiniu/images/name3.png

则同步到远端后的文件名则为:

    images/name1.png
    images/name2.png
    images/name3.png

链接为：

    http://bucket.qiniudn.com/images/name1.png
    http://bucket.qiniudn.com/images/name2.png
    http://bucket.qiniudn.com/images/name3.png

有同学想整个博客静态页面 `_site` 同步上去，那么文章中老老实实的写本地路径吧：

    ![image](/your/path/image)

随后，`sync_dir` 为 `_site` 即可。

以后，写博客，有新加图片的时候，在 push 之前，先 `rake qrsync` 上传下即可。不过鄙人这里测试，配置 `"deletable":    1,` 无效，就是说，本地删除某图片，远端不会删除，真囧（难道是我姿势不对）。
