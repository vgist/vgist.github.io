---
layout: post
title: "中国农历 ccal Ebuild"
description: "简单的cli农历显示工具"
keywords: ccal, ebuild, 农历, gentoo
category: Linux
tags: [ccal, Ebuild, Gentoo, Packager]
---

简单的cli农历显示工具，感谢 [http://ccal.chinesebay.com/ccal/ccal.htm](http://ccal.chinesebay.com/ccal/ccal.htm) 作者。

感觉 Gentoo 用户写脚本的热情实在是不高啊，N多小工具都没得，于是抽空写了个简单的 Ebuild。

<!-- more -->
```bash
# Copyright 1999-2009 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $
 
EAPI="1"
 
inherit eutils
 
DESCRIPTION="The ccal utility is a simple-to-use command line program which writes a Gregorian calendar together with Chinese calendar to standard output."
HOMEPAGE="http://ccal.chinesebay.com/ccal/ccal.htm"
 
LICENSE="GPL"
SLOT="0"
KEYWORDS="~amd64 ~x86 amd64 x86"
IUSE=""
SRC_URI="http://ccal.chinesebay.com/${PN}/${P}.tar.gz"
 
RDEPEND="sys-devel/gcc
    sys-libs/glibc"
 
src_compile() {
    emake || die "emake failed"
}
 
src_install() {
    dobin ccal ccalpdf || die "dobin failed"
    doman ccal.1 ccalpdf.1 || die "doman failed"
}
```

更新地址：[https://github.com/Ihavee/overlay/tree/master/app-misc/ccal](https://github.com/Ihavee/overlay/tree/master/app-misc/ccal)
