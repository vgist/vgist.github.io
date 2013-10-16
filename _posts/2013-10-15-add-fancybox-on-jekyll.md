---
layout: post
title: "给 Jekyll 添加 FancyBox"
description: ""
keywords: "Jekyll, fancybox, jquery, plugins"
category: Internet 
tags: [Jekyll, FancyBox, jquery]
---
{% include JB/setup %}

既然是博客是以 **Jekyll** 来驱动的，那么尽量在本地生成静态页面再推送到服务端，也就是说，尽量不用插件。在这个前提下如果给图片一些特殊的效果，譬如 [**FancyBox**][1]、[**Lightbox2**][2]？

![FancyBox](/assets/images/2013/10/fancybox.png "FancyBox")

那么如何给 Jekyll 无插件的添加特效呢，[**jquery**][3]！

<!-- more -->
其中有个问题，markdown 中的图片我们一般是如此写法

```
![image tag](image url "image name")
```

生成的 html 为

```html
<image title="image name" alt="image name" src="url">
```

我们如果要使用（譬如）FancyBox 的话，则需要如下的链接才可

```html
<a href="url" id="id">
  <imge src="url">
</a>
```

既然目的明确，那么动手

首先[下载][4] fancybox，解压到你的主题文件夹，譬如我的是 `assets/themes/havee` 下，编辑模板，在 head 区域添加

{% raw %}
```html
<link href="{{ ASSET_PATH }}/fancybox/jquery.fancybox.css?v=2.1.5" rel="stylesheet" media="all" />
```
{% endraw %}

在 body 区域最下方添加

{% raw %}
```html
<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js"></script>
<script type="text/javascript" src="{{ ASSET_PATH }}/fancybox/jquery.fancybox.pack.js?v=2.1.5"></script>
<script>
// 给图片添加链接
$(document).ready(function() {
  $("p img").each(function() {
    var strA = "<a id='fancyBox' href='" + this.src + "'></a>";
    $(this).wrapAll(strA);
  });
});

// fancybox
$("#yourid").fancybox({
  openEffect	: 'elastic',
  closeEffect	: 'elastic',
});
</script>
```
{% endraw %}

如果你模板本身就引用`<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js"></script>`，则这里不必再次引用。

FancyBox 具体用法：

- [http://fancyapps.com/fancybox](http://fancyapps.com/fancybox)

[1]: http://fancybox.net/
[2]: http://lokeshdhakar.com/projects/lightbox2/
[3]: http://jquery.com/
[4]: https://github.com/fancyapps/fancyBox/zipball/v2.1.5
