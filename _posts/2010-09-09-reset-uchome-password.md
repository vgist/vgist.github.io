---
layout: post
title: "UChome 密码重置"
category: Internet
tags: [Internet]
---

首先需要清楚 salt

    $ select * from uc_members where uid=“id”;

查看 salt 字段的值，譬如 salt=123456

```
$ php -a
Interactive shell
php >  echo $password = md5(md5(“newpassword").”123456");
2f1b3f708c241e73010dbb3dbd343bfa
php > exit
```

<!-- more -->

随后进 mysql 更新新密码即可

```
$ mysql -u user -p db_name
mysql > update uc_members set password=“2f1b3f708c241e73010dbb3dbd343bfa” where uid=“id"
```
