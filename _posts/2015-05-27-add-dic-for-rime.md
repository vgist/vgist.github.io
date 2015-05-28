---
layout: post
title: "给 Rime 添加第三方词库"
category: Mac
tags: [Rime]
---

#### 一、 添加词库

介绍就不多说了，直入命题，转换词典需要三列数据，词汇，拼音，词频，由于我的系统是 OS X & Linux，无法使用 [imewlconverter](https://github.com/studyzy/imewlconverter)，故我采用的是人家整理好的词库，需要做一些转换。

工具可以在此下载：[rime\_dict\_manager.zip](http://cdn.09hd.com/images/2015/05/rime_dict_manager.zip)，你可能需要 `chmod +x file` 来加上执行权限。

词库文件可以去这里下载：<https://code.google.com/p/hslinuxextra/downloads/list>

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
力量    li liang
能力    neng li
那你    na ni
内容    nei rong
……
```

可以看出，三列分别以 tab 制表符来分割，拼音之间以空格分割，那么就方便了

    awk -F" " 'BEGIN{OFS="\t"}{print $2,$1}' pyPhrase.org > pyPhrase.org.dic
    sed -i '' "s/\'/ /g" ./pyPhrase.org.dic

随后就只剩下转换了

    ./rime_dict_manager -i luna_pinyin pyPhrase.org.dic

该命令会生成 rime 的词库，名为 **luna_pinyin.userdb.kct**

将 **luna\_pinyin.userdb.kct** 拷贝到 **~/Library/Rime** 下，重新部属下 Rime 即可。

当然有同学可能手上有其他词库，格式不同的话，对应的修改成我们需要的词库格式即可。

#### 二、 自建输入方案

为了跟默认的配置分开，这里还是建议添加自己的输入方案，当然词库合并进 **luna\_pinyin** 后的首选词总是感觉比较怪异也是另一原因。

这里就拿 **sogou\_pinyin** 为例，自建输入方案需要新增两个必备的文件与修改一配置文件。

- 新增 **sogou\_pinyin.userdb.kct** 词库文件（此文件由上面 **rime\_dict\_manager** 得到）；
- 新增方案配置文件 **sogou\_pinyin.schema.yaml** 文件（复制默认的 **luna_pinyin_simp.schema.yaml** 去修改，依样画葫芦）；
- 修改 **default.custom.yaml** 全局配置文件，添加 **sogou\_pinyin** 输入方案。

##### sogou\_pinyin.userdb.kct

搜狗的词库上面已经说了

    ./rime_dict_manager -i sogou_pinyin pyPhrase.org.dic

##### sogou\_pinyin\_schema.yaml

```yaml
# Rime schema
# encoding: utf-8

schema:
  schema_id: sogou_pinyin
  name: 搜狗拼音
  version: "0.01"
  author:
    - 搜狗
  description: |
    搜狗拼音，簡化字模式。

switches:
  - name: ascii_mode
    reset: 0
    states: [ 中文, 西文 ]
  - name: full_shape
    states: [ 半角, 全角 ]
  - name: zh_simp
    reset: 1
    states: [ 漢字, 汉字 ]
  - name: ascii_punct
    states: [ 。，, ．， ]

engine:
  processors:
    - ascii_composer
    - recognizer
    - key_binder
    - speller
    - punctuator
    - selector
    - navigator
    - express_editor
  segmentors:
    - ascii_segmentor
    - matcher
    - abc_segmentor
    - punct_segmentor
    - fallback_segmentor
  translators:
    - punct_translator
    - table_translator@custom_phrase
    - script_translator
  filters:
    - simplifier
    - uniquifier

speller:
  alphabet: zyxwvutsrqponmlkjihgfedcba
  delimiter: " '"
  algebra:
    - erase/^xx$/
    - abbrev/^([a-z]).+$/$1/
    - abbrev/^([zcs]h).+$/$1/
    - derive/^([nl])ve$/$1ue/
    - derive/^([jqxy])u/$1v/
    - derive/un$/uen/
    - derive/ui$/uei/
    - derive/iu$/iou/
    - derive/([aeiou])ng$/$1gn/
    - derive/([dtngkhrzcs])o(u|ng)$/$1o/
    - derive/ong$/on/
    - derive/ao$/oa/
    - derive/([iu])a(o|ng?)$/a$1$2/

translator:
  dictionary: luna_pinyin
  prism: sogou_pinyin
  preedit_format:
    - xform/([nl])v/$1ü/
    - xform/([nl])ue/$1üe/
    - xform/([jqxy])v/$1u/

custom_phrase:
  dictionary: ""
  user_dict: custom_phrase
  db_class: stabledb
  enable_completion: false
  enable_sentence: false
  initial_quality: 1

simplifier:
  option_name: zh_simp

punctuator:
  import_preset: default

key_binder:
  import_preset: default
  bindings:
    - { when: always, accept: Control+Shift+4, toggle: zh_simp }
    - { when: always, accept: Control+Shift+dollar, toggle: zh_simp }

recognizer:
  import_preset: default
```

##### default.custom.yaml

```yaml
patch:
  scheme_list: &a
  - schema: sogou_pinyin
  schema_list: *a
```

随后重新部署即完成了自建自己的输入方案。

最后推荐一个 OS X 下的 Rime 设置工具：<https://github.com/neolee/SCU>
