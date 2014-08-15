---
layout: post
title: "Wordpress 更换域名"
description: "域名更换为 Ihavanna.Org"
keywords: ihavanna, org, 域名
category: Internet
tags: [Wordpress, Domain, SQL, Usage]
---

已经完美更换，期间无非是数据库中的域名需更改下而已

譬如我博客之前域名是 `blog.bnci.cn`，现在更换为 `ihavanan.org`

`ssh` 登录服务器，`mysql` 登录，再 `use` 使用的数据库名，接下来敲入下面三行

```sql
UPDATE wp_posts SET post_content = replace( post_content, 'blog.bnci.cn','ihavanna.org') ;
UPDATE wp_comments SET comment_content = replace(comment_content, 'blog.bnci.cn', 'ihavanna.org') ;
UPDATE wp_comments SET comment_author_url = replace(comment_author_url, 'blog.bnci.cn', 'ihavanna.org') ;
```

<!-- more -->
ok 了，基本解决，下面对搜索引擎友好点了，毕竟蜘蛛可不知道你更换了域名

nginx配置文件

```nginx
if ($host != ‘ihavanna.org’ ) {
    rewrite ^/(.*)$ http://ihavanna.org/$1  permanent;
}
```

完美解决
