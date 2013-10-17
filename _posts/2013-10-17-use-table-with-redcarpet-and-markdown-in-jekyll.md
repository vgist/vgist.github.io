---
layout: post
title: "Markdown 之使用表格"
description: "要在 markdown 中使用表格，需要 redcarpet 语法解释引擎"
keywords: "markdown, 表格, table, redcarpet, jekyll"
category: Internet
tags: [Markdown, Jekyll, Redcarpet]
---
{% include JB/setup %}

看到人家在 [Markdown][markdown] 文件中随意的书写表格，但再我自己的博客中却怎么也无法输出表格样式，最后还是通过 Google 才找到答案，需要语法解释引擎 [Redcarpet][redcarpet]，且开启 **tables** 选项。

而在 [Jekyll][jekyll] 中使用，请修改 `_config.yml`

```yaml
markdown: redcarpet
    redcarpet: 
        extensions: ["tables"]
```

随后

    gem install redcarpet

<!-- more -->
在 Markdwon 文件中可以依据一下语法进行书写

```
|head1 head1 head1|head2 head2 head2|head3 head3 head3|
|:---|---|---:|
|row1text1|row1text3|row1text3|
|row2text1|row2text3|row2text3|
```

其中 `:`所在位置表示表格的位置对齐

其最后输出的代码是

|head1 head1 head1|head2 head2 head2|head3 head3 head3|
|:---|---|---:|
|row1text1|row1text3|row1text3|
|row2text1|row2text3|row2text3|

最后，当然别忘记给模板中的 `table thead tobody th tr td` 设置样式。

redcarpet有很多选项可以开启，譬如我就开启了

```yaml
markdown: redcarpet
    redcarpet: 
        extensions: ["fenced_code_blocks", "tables", "highlight", "with_toc_data", "strikethrough", "underline"]
```

参考：

- [https://github.com/vmg/redcarpet][redcarpet]

[markdown]: internet/2013-07/markdown-syntax.html
[redcarpet]: https://github.com/vmg/redcarpet
[jekyll]: http://jekyllrb.com/