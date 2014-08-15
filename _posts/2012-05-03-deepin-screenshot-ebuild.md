---
layout: post
title: "Deepin-screenshot ebuild"
description: "gentoo 的 ebuild 还是不丰富啊，凡事总得自己动手才能丰衣足食"
keywords: deepin, screenshot, ebuild, gentoo
category: Linux
tags: [Screenshot, Gentoo, Ebuild, Deepin, Packager]
---

![Deapin-Screenshot]({{ site.qiniudn }}/images/2012/05/deepin-screenshot.png "Deapin-Screenshot")

gentoo 的 ebuild 还是不丰富啊，凡事总得自己动手才能丰衣足食。

<!-- more -->
deepin-screenshot 是 deepin ( 深度 ) 出品的采用 python 写的截图工具。

主要特性：

- 智能窗口识别
- 支持手动选择截图区域
- 简洁截图编辑
- 延迟截图功能

使用方法：

    Usage: deepin-screenshot [options] [arg]
 
    Options:
      --version             show program's version number and exit
      -h, --help            show this help message and exit
      -f, --full            Taking the fullscreen shot
      -w, --window          Taking the currently focused window
      -d NUM, --delay=NUM   wait NUM seconds before taking a shot
      -s FILE, --save=FILE  save screenshot to FILE

至于快捷键，因为桌面环境五花八门，还是自己通过控制中心绑定 deepin-screenshot 吧，ebuild 中就不给出了。

闲话少说，给出gentoo ebuild：

```bash
# Copyright 1999-2012 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v3
# $Header: $
 
EAPI="4"
 
inherit git-2
 
EGIT_REPO_URI="git://github.com/lovesnow/deepin-screenshot.git"
 
DESCRIPTION="Snapshot tools for linux deepin."
HOMEPAGE="https://github.com/lovesnow/deepin-screenshot"
 
LICENSE="LGPL-3"
SLOT="0"
KEYWORDS="~amd64 ~x86"
IUSE=""
 
RDEPEND="dev-lang/python:2.7
    dev-python/pygtk:2
    dev-python/python-xlib"
DEPEND="${RDEPEND}"
 
src_prepare() {
    sh updateTranslate.sh || die "failed to update Translate"
    rm -rf po || die
    rm -rf debian || die
}
 
src_install() {
    dodoc AUTHORS ChangeLog README
 
    insinto "/usr/share/deepin-screenshot"
    doins -r ${S}/locale ${S}/src ${S}/theme
    fperms 0755 /usr/share/deepin-screenshot/src/*
 
    dosym /usr/share/${PN}/src/${PN} /usr/bin/${PN}
}
```

[https://github.com/Ihavee/overlay/blob/master/media-gfx/deepin-screenshot](https://github.com/Ihavee/overlay/blob/master/media-gfx/deepin-screenshot)
