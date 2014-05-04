---
layout: post
title: "OS X 上的 pip 使用 User Installs"
description: "pip 安装包到用户目录"
keywords: "pip, user, 用户目录"
category: Mac
tags: [pip,Python]
---
{% include JB/setup %}

可能还是使用 Gentoo 后带来的洁癖使然，在 Mac OS X 上也想将 `pip install package` 默认安装到用户目录，随便一搜，都是 `sudo`，难道大家都习惯直接拿根目录开刀的？今天上午查询了下资料，搞定将 pip 安装的包默认安装在用户目录。

说起来很简单，只需跟参数 `--user` 即可，譬如

    'python setup.py install --user'

或

    python setup.py install --home=<dir>

<!-- more -->
同理使用 pip 安装时只需

    pip install package --user

首先配置下常规的 pip 参数

    mkdir -p ~/.pip
    touch ~/.pip/pip.conf

编辑 `~/.pip/pip.conf`

```conf
[global]
default-timeout = 60
download-cache = ~/.pip/cache
log-file = ~/.pip/pip.log

[install]
index-url = http://pypi.douban.com/simple
```

编辑 `~/.bash_profile`，最后加入

    export PYTHONUSERBASE=$PATH/Library/Python/2.7
    if [ -d $HOME/Library/Python/2.7/bin ]; then
        export PATH=$HOME/Library/Python/2.7/bin:$PATH
    fi

最后，将系统的 `site-packages` 路径加进去

    echo '/usr/local/lib/python2.7/site-packages' > ~/Library/Python/2.7/lib/python/site-packages/homebrew.pth

完工。

参考：
- [https://docs.python.org/2/install/index.html#alternate-installation-the-user-scheme](https://docs.python.org/2/install/index.html#alternate-installation-the-user-scheme)
- [http://www.pip-installer.org/en/latest/user_guide.html#user-installs](http://www.pip-installer.org/en/latest/user_guide.html#user-installs)
