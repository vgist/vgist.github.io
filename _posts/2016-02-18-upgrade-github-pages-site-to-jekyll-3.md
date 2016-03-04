---
layout: post
title: "托管于 Github Pages 的博客升级至 jekyll 3"
category: Internet
tags: [Jekyll]
---

昨天收到 Github 的邮件，提示 GitHub Pages 将于 5 月 1 号以后只支持 kramdown。

>......
>You are currently using the 'redcarpet' Markdown engine, which will not be supported on GitHub Pages after May 1st. At that time, your site will use 'kramdown' for markdown rendering instead. To suppress this warning, remove the 'markdown' setting in your site's '_config.yml' file and confirm your site renders as expected. For more information, see https://help.github.com/articles/updating-your-markdown-processor-to-kramdown.
>......

<!-- more -->

马上翻到官网看了下，在 Jekyll 3 中，一些功能被剥离，成为插件，这意味着 `--safe` 模式下，一些 Jekyll 2 下的功能不被支持，如下：

- jekyll-paginate
- jekyll-coffescript
- jekyll-gist
- pygments.rb
- redcarpet
- toml
- classifier-reborn

如果你托管于 Github Pages，可以在 5 月 1 日前后关注 <https://pages.github.com/versions/> 上的变化。

好吧，动手进行版本升级吧。

##### Upgrade

    gem upgrade jekyll

注意，Jekyll 3 需要 Ruby >= 2.0.0

##### Kramdown

首先要做的，就是修改 markdown 解析引擎至 [Kramdown](http://kramdown.gettalong.org/)

- 移除 **_config.yml** 中的 `markdown: xxx`
- 添加 kramdown 的 GFM 支持

    kramdown:
      input: GFM

##### Syntax Highlighting

语法高亮将仅支持 [**Rouge**](http://rouge.jneen.net/)

- 移除 **_config.yml** 中的 `highlighter:xxx`

可能，你模版的 style 也需要一些变动。

##### Relative Permalink

- Jekyll 3 以后的版本，默认情况下，Permalink 中将不再支持相对路径，可以通过 `relative_permalinks: true` 来开启
- Jekyll 3 以后的版本，Permalink 不再自动添加 trailing slash

譬如 `permalink: /:year-:month-:day-:title`

- jekyll 2 中，生成 example.com/2016-02-18-text
- jekyll 3 中，生成 example.com/2016-02-18-test.html

所以，如果你想在 jekyll 3 中仍然目录形式，那么你需要修改成如此：`permalink: /:year-:month-:day-:title/`

##### jekyll-paginate

这个应该是一个基本功能，是在想不通，为什么 Jekyll 默认剥离

- 修改 **_config.yml**，添加 `gems: [jekyll-paginate]`

如此 Github Pages 上就正常运行了，本地的话，还需要 `gem install jekyll-paginate`

参考：

- <https://github.com/blog/2100-github-pages-now-faster-and-simpler-with-jekyll-3-0>
- <http://jekyllrb.com/docs/upgrading/2-to-3/>
