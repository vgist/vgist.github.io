---
layout: post
title: "给 Rime 添加第三方词库"
category: Mac
tags: [Rime]
---

介绍就不多说了，直入命题，转换词典需要三列数据，词汇，拼音，词频，我采用的是人家给 Fcitx 准备的搜狗词库，需要做一些转换。

工具和词库可以在此下载：[fcitx-sogou-phrase-small.zip](http://cdn.09hd.com/images/2015/05/fcitx-sogou-phrase-small.zip)

包含两个文件，转换工具文件（可能需要 `chmod +x file` 加上执行权限），以及词库文件。

实际上，转换工具 **rime\_dict\_manager** 是自带的，路径在 `/Library/Input Methods/Squirrel.app/Contents/MacOS` 下，可以写成 bash 脚本：

```bash
DYLD_LIBRARY_PATH="/Library/Input Methods/Squirrel.app/Contents/Frameworks" "/Library/Input Methods/Squirrel.app/Contents/MacOS/rime_dict_manager" $@
```

<!-- more -->
以下是 sogou for fcitx 的精简后的词库格式

```
li'liang 力量
neng'li 能力
na'ni 那你
nei'rong 内容
……
```

而如下才是我们需要的格式

```
力量    li liang    1
能力    neng li     1
那你    na ni       1
内容    nei rong    1
……
```

可以看出，三列分别以 tab 制表符来分割，拼音之间以空格分割，那么就方便了

    awk -F" " 'BEGIN{OFS="\t"}{print $2,$1,"1"}' pyPhrase.org > pyPhrase.org.dic
    sed -i '' "s/\'/ /g" ./pyPhrase.org.dic

随后就只剩下转换了

    ./rime_dict_manager -i luna_pinyin pyPhrase.org.dic

该命令会升成 rime 的词库，名为 **luna_pinyin.userdb.kct**

将 **luna_pinyin.userdb.kct** 拷贝到 **~/Library/Rime** 下，重新部属下 Rime 即可。

当然有同学可能手上有其他词库，格式不同的话，对应的修改成我们需要的词库格式即可。

最后推荐一个 OS X 下的 Rime 设置工具：<https://github.com/neolee/SCU>
