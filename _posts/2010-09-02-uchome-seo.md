---
layout: post
title: "UChome 2.0 SEO 优化"
description: "UChome 2.0 SEO 优化"
keywords: uchome, seo, 优化
category: Internet
tags: [UChome, SEO, Usage]
---

首先在模板 `header.htm` 加上代码：

```html
<!--{if $_TPL['keywords']}-->
 <meta name="keywords" content="$_TPL['keywords']" />
<!--{/if}-->
<!--{if $_TPL['descriptions']}-->
 <meta name="description" content="$_TPL['descriptions']" />
<!--{/if}-->
```

<!-- more -->
这些简单是条件判断语句应该很简单但是，这样搞是一点效果都没有的，还需要修改 `space_blog_view.htm`。用标签来做关键字是 `SEO` 最好的了。

`implode` 这个函数是将多个字符串用指定的字符串将它分割，可以实现:a,b,c,d ,e这样的格式。

`getstr($blog['message'], 180, 0, 0, 0, 0, -1)`这个是截取长度（官方函数库自带）。

```
<!--{eval $_TPL['keywords'] = implode(',', $blog['tag']);}-->
<!--{eval $content=str_replace("&nbsp;","",$blog['message']);}-->
<!--{eval $description=preg_replace("'([\r\n])[\s]+'","",$content);}-->
<!--{eval $_TPL['descriptions'] = getstr($description, 208, 0, 0, 0, 0, -1);}-->
```
