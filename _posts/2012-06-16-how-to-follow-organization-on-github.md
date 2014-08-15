---
layout: post
title: "GitHub 中 Follow Organization"
description: "在 GitHub 中 Follow Organization"
keywords: github, follow, organization, javascript
category: Linux
tags: [GitHub]
---

其实很简单，不过老实说，follow organization 真的没多大意义哈。

首先访问你的followed users，譬如 `https://github.com/Havanna/following`

然后在你的浏览器的 javascript console 中运行一行代码即可，譬如 firefox 中打开 web console，点击 Net 可以实时观察 follow 情况，再运行下面的一行 js ( 名字替换成你自己的 )。譬如我要 follow goagent 这个组织，那就是

    $.post("https://github.com/users/follow?target=goagent");

<!-- more -->

刷新页面，即可看到你已经 follow 了一个 goagent 这个organization 了，记住，输入回车是 follow，再输入回车，则变成 unfollow 了。

具体步骤：

1. 打开你浏览器的 javascript console，我这里用的是firefox 的 web console，点击 Net，

    ![follow 1]({{ site.qiniudn }}/images/2012/06/follow-1.png "follow 1")

2. 输入代码

    ![follow 2]({{ site.qiniudn }}/images/2012/06/follow-2.png "follow 2")

3. 回车后查看结果

    ![follow 3]({{ site.qiniudn }}/images/2012/06/follow-3.png "follow 3")

4. 刷新页面检查

    ![follow 4]({{ site.qiniudn }}/images/2012/06/follow-4.png "follow 4")

参考资料：[http://www.ailis.de/~k/archives/71-How-to-follow-an-organization-on-GitHub.html](http://www.ailis.de/~k/archives/71-How-to-follow-an-organization-on-GitHub.html)
