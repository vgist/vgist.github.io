---
layout: post
title: "Aliedit -- 支付宝Linux版插件"
description: "Aliedit -- 支付宝Linux版插件"
keywords: aliedit, linux, gentoo, ebuild, 插件, 支付宝
category: Linux
tags: [aliedit, Gentoo, Ebuild, Plugin]
---

gentoo 的ebuild 还是不丰富，很多还是得自己写 ebuild

gentoo-zh 也换到 github 上了，什么时候更新到 gentoo-zh 中去，闲话少说，给出 ebuild

<!-- more -->
```bash
# Copyright 1999-2008 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $
 
EAPI=2
inherit nsplugins
 
DESCRIPTION="Alipay Secure Edit Component"
SRC_URI="https://download.alipay.com/alipaysc/linux/${PN}/${PV}/${PN}.tar.gz"
HOMEPAGE="http://www.alipay.com/"
IUSE=""
SLOT="0"
 
KEYWORDS="~amd64 ~x86"
LICENSE="Alipay"
RESTRICT="strip mirror"
 
RDEPEND="amd64? ( media-libs/libpng:1.2 )
    x86? ( media-libs/libpng )
    x11-libs/gtk+:2"
 
src_compile() {
    ARCHIVE=`awk '/^__ARCHIVE_BELOW__/ {print NR + 1; exit 0; }' ./aliedit.sh`
    tail -n+$ARCHIVE aliedit.sh | tar xzvm -C ./ \
    || die "Can't get archive files"
}
 
src_install() {
    insinto "/opt/netscape/plugins"
    if use amd64; then
        doins "${WORKDIR}"/lib/libaliedit64.so
        inst_plugin /opt/netscape/plugins/libaliedit64.so
    else
        doins "${WORKDIR}"/lib/libaliedit32.so
        inst_plugin /opt/netscape/plugins/libaliedit32.so
    fi
}
```

更新地址：[https://github.com/Ihavee/overlay/tree/master/www-plugins/aliedit](https://github.com/Ihavee/overlay/tree/master/www-plugins/aliedit)
