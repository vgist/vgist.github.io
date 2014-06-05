---
layout: post
title: "Homebrew 脚本 GoAgent"
description: "Mac OS X 下的 GoAgentX 不太好用，也比较吃资源。况且一般情况下，GoAgent 在我电脑上基本是以服务运行的。今天下午翻了下 Homebrew 的开发说明，自己照着写了个 GoAgent 安装脚本。"
keywords: "goagent, homebrew, brew, osx"
category: MAC
tags: [goagent, Homebrew]
---
{% include JB/setup %}

Mac OS X 下的 GoAgentX 不太好用，也比较吃资源。况且一般情况下，GoAgent 在我电脑上基本是以服务运行的。今天下午翻了下 Homebrew 的开发说明，自己照着写了个 GoAgent 安装脚本。

用法：

    $ brew tap Ihavee/havee
    $ brew install goagent

<!-- more -->
Homebrew 扩展阅读：[Homebrew 的安装与使用](/mac/2013-12/how-to-install-and-use-homebrew.html)

安装完成后，按照说明

    $ ln -sfv /usr/local/opt/goagent/*.plist ~/Library/LaunchAgents/

编辑文件，填入你 GAE 的 appid 与 密码

    $ vim /usr/local/etc/goagent

为了方便后面使用，可以使用 aliases

    $ echo "alias goagent.start='launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.goagent.plist'" >> ~/.bashrc
    $ echo "alias goagent.stop='launchctl unload -w ~/Library/LaunchAgents/homebrew.mxcl.goagent.plist'" >> ~/.bashrc
    $ echo "alias goagent.restart='goagent.stop && goagent.start'" >> ~/.bashrc

使用时就可以方便的使用命令行

	$ goagent.start
	$ goagent.stop
	$ goagent.restart

源码地址：[https://github.com/Ihavee/homebrew-havee](https://github.com/Ihavee/homebrew-havee)。

```ruby
require "formula"

class Goagent < Formula
  homepage "https://code.google.com/p/goagent"
  url "https://github.com/goagent/goagent/archive/v3.1.16.tar.gz"
  head "https://github.com/goagent/goagent.git", :branch => "3.0"
  sha1 "778ab89a67b50d39a9983dd3592b9810f74b9716"

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
      etcfile.write
      <<-EOS.undent
      [gae]
      appid = id
      password = password
      regions = cn|jp
      keepalive = 1
      sslversion = SSLv23

      [dns]
      enable = 0
      listen = 127.0.0.1:8053

      [pac]
      enable = 0
      listen = 127.0.0.1:8054

      [iplist]
      google_cn = 203.208.46.200|203.208.46.201|203.208.46.206|203.208.46.208|203.208.46.209|203.208.46.210|203.208.46.211|203.208.46.212|203.208.46.215
      google_hk = 203.66.124.216|203.66.124.217|203.66.124.221|203.66.124.222|203.66.124.226|203.66.124.227|203.66.124.231|203.66.124.232|203.66.124.236|203.66.124.237|203.66.124.241|203.66.124.242|203.66.124.246|203.66.124.247
      EOS
    end

    local.install_symlink etcfile => "proxy.user.ini"
  end

  def caveats
    <<-EOS.undent
    edit:
        vim #{etcfile}
        ln -sfv #{opt_prefix}/*.plist ~/Library/LaunchAgents

    install CA.crt:
        sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" "#{opt_prefix}/local/CA.crt"

    if you want [dns].enable = 1, you need install pip, and then run:
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
            <key>StandardOutPath</key>
            <string>#{var}/log/goagent.log</string>
            <key>StandardErrorPath</key>
            <string>#{var}/log/goagent.log</string>
        </dict>
    </plist>
    EOS
  end
end

```

**注意**：pip 安装 gevent 过程中可能会出现错误提示


    clang: error: unknown argument: '-mno-fused-madd' [-Wunused-command-line-argument-hard-error-in-future]

这是 Xcode 5.1 开始，编译器 LLVM 规定对未知参数的传入，视为错误。解决方法是：

    echo "export ARCHFLAGS=-Wno-error=unused-command-line-argument-hard-error-in-future" >> ~/.bashrc

pip 扩展阅读：[OS X 上的 pip 使用 User Installs](/mac/2014-05/individual-scheme-for-pip.html)

参考：[https://github.com/Homebrew/homebrew/wiki/Formula-Cookbook](https://github.com/Homebrew/homebrew/wiki/Formula-Cookbook)
