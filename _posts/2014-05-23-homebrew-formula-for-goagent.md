---
layout: post
title: "Homebrew 脚本 Goagent"
description: ""
keywords: ""
category: MAC
tags: [goagent, Homebrew]
---
{% include JB/setup %}

Mac OS X 下的 GoAgentX 不太好用，也比较吃资源。况且一般情况下，GoAgent 在我电脑上基本是以服务运行的。今天下午翻了下 Homebrew 的开发说明，自己照着写了个 GoAgent 安装脚本。

用法：

    $ brew tap Ihavee/havee
    $ brew install goagent

<!-- more -->
安装完成后，按照说明

    $ ln -sfv /usr/local/opt/goagent/*.plist ~/Library/LaunchAgents/

编辑文件，填入你 GAE 的 appid 与 密码

    $ vim /usr/local/etc/goagent

为了方便后面使用，可以使用 aliases

    $ echo "alias goagent.start='launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.goagent.plist'" >> ~/.bashrc
    $ echo "alias goagent.stop='launchctl unload -w ~/Library/LaunchAgents/homebrew.mxcl.goagent.plist'" >> ~/.bashrc
    $ echo "alias goagent.restart='goagent.stop && goagent.start'" >> ~/.bashrc

源码地址：[https://github.com/Ihavee/homebrew-havee](https://github.com/Ihavee/homebrew-havee)。

```ruby
require "formula"

class Goagent < Formula
  homepage "https://code.google.com/p/goagent"
  url "https://github.com/goagent/goagent/archive/v3.1.12.tar.gz"
  head "https://github.com/goagent/goagent.git", :branch => "3.0"
  sha1 "9fc10c58b92c77014f8d6586fb9376b0038798d6"

  option "upload", "install upload scripts"
  depends_on :python2

  def etcfile
    etc/"goagent"
  end

  def local
    prefix/"local"
  end

  def install
    if build.with? "upload"
      prefix.install Dir["local" "server"]
    else
      prefix.install Dir["local"]
    end

    unless etcfile.exist?
      etcfile.write <<-EOS.undent
      [gae]
      appid = id
      password = password

      [dns]
      enable = 0
      listen = 127.0.0.1:8053

      [pac]
      enable = 0
      listen = 127.0.0.1:8054
      EOS
    end

    local.install_symlink etcfile => "proxy.user.ini"
  end

  def caveats
    <<-EOS.undent
    edit:
        vim #{etcfile}

    if you want to [dns].enable = 1, you need install pip, and then run:
        pip install dnslib
        pip install gevent
    EOS
  end

  def plist
    <<-EOS.undent
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
        <dict>
            <key>RunAtLoad</key>
            <true/>
            <key>KeepAlive</key>
            <true/>
            <key>Label</key>
            <string>#{plist_name}</string>
            <key>NetworkState</key>
            <true/>
            <key>ProgramArguments</key>
            <array>
                <string>/usr/bin/python2.7</string>
                <string>#{opt_prefix}/local/proxy.py</string>
            </array>
            <key>ServiceDescription</key>
            <string>GoAgent Local Service</string>
        </dict>
    </plist>
    EOS
  end
end

```

参考：[https://github.com/Homebrew/homebrew/wiki/Formula-Cookbook](https://github.com/Homebrew/homebrew/wiki/Formula-Cookbook)
