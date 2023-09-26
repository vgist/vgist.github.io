---
layout: post
title: "GnuPG 介绍"
category: Linux
tags: [GnuPG, Keys, Public]
---

#### 一、介绍

PGP（Pretty Good Privacy），是一个基于 RSA 公钥加密体系的邮件加密软件。它不但可以对用户的数据保密以防止非授权者阅读，还能对用户的邮件加上数字签名从而使收 信人确信邮件是由该用户发出。让人们可以安全地和从未见过的人们通信，而事先不需要任何保密的渠道用来传递密钥。PGP 采用了审慎的密钥管理，一种 RSA 和传统加密的杂合算法，用于数字签名的邮件文摘算法，加密前压缩等。它功能强大，速度很快。

GnuPG 是实现安全通信和数据存储的一系列工具集，可以做加密数据和做数字签名之用。在功能上，它和 PGP 是 一样的。由于 PGP 使用了 IDEA 专利算法，所以使用 PGP 会有许可证的麻烦。但是 GnuPG 并没有使用这个算法，所以对用户来说使用 GnuPG 没有任何 限制。GnuPG 使用非对称加密算法，安全程度比较高。GnuPG 主要有以下特点：

<!-- more -->

1. 完全兼容 PGP
2. 没有使用任何专利算法，没有专利问题
3. 遵循 GNU 公共许可证
4. 与 OpenPGP 兼容
5. 使用广泛，安全性高于 PGP2，可以加密校验和 PGP5.x 格式的信息
6. 支持多种加密算法
7. 支持扩展模块
8. 用户标识遵循标准结构
9. 多语言支持
10. 支持匿名信息接收
11. 支持HKP密钥服务

一些基本概念：

密钥用途：

- \[S\]: 用于签名
- \[E\]: 用于加密
- \[A\]: 用于身份认证
- \[C\]: 主密钥特有，用于认证子密钥

密钥算法

- RSA
- ElGamal
- DSA
- ECDH
- ECDSA
- EdDSA
- ...

ECC 算法，在版本 2.1.0 ，支持 ed25519 数字签名，在版本 2.1.7 ，支持 curve25519 加密，需要在操作时时添加参数 `--expert`，顾名思义，专家模式

#### 二、命令

##### 创建主密钥对

    $ gpg --full-gen-key                                # 生成密钥对，默认 RSA 算法
    # or
    $ gpg --default-new-key-algo rsa4096 --full-gen-key
    $ gpg --gen-revoke KEY_ID                           # 为 ID 生成吊销密钥
    $ gpg --send-keys KEY_ID                            # 发布公钥

##### 创建子密钥

    $ gpg --edit-key KEY_ID     # 假设刚生成的密钥
    ......
    gpg> addkey                 # 根据实际需求选择签名还是加密

一个主密钥对，可以绑定若干子密钥对，子密钥对具备加密或签名功能。任何时候，你应该在非主设备上只使用子密钥对，不应该分发主密钥，你的主密钥应该保存在安全的地方。

#### 显示密钥 ID

    $ gpg -K --keyid-form LONG                      # or
    $ gpg -K --keyid-format LONG
    $ git config --global user.signingkey KEY_ID    # git 中添加签名密钥

##### 公钥处理

    $ gpg --armor --output filename.asc --export KEY_ID # ASCII 格式导出公钥
    $ gpg --armor --output sub.asc --export SUBKEY_ID!  # 导出 sub ID 子密钥公钥
    $ gpg --list-public-keys|-k                         # 显示所有公钥，或
    $ gpg --check-sig                                   # 监测公钥环中公钥的签名信息
    $ gpg --fingerprint KEY_ID                          # 查看公钥指纹信息

##### 私钥处理

    $ gpg --armor --output filename.asc --export-secret-keys KEY_ID         # 导出 ID 的主私钥，不加用户标志，则导出所有主私钥
    $ gpg --armor --output filename.asc --export-secret-subkeys SUBKEY_ID!  # 导出 sub ID 的子密钥私钥
    $ gpg --list-secret-keys|-K                                             # 显示所有私钥

##### 其他

    $ gpg --import filename.asc                 # 导入私钥或公钥
    $ gpg --delete-secret-and-public-key KEY_ID # 删除私钥和公钥
    $ gpg --delete-secret-key KEY_ID            # 删除私钥
    $ gpg --delete-key KEY_ID                   # 删除公钥

    $ gpg --edit-key KEY_ID  # 编辑密钥，要帮助输入 help
    gpg> help
    quit        退出此菜单
    save        保存并退出
    help        显示此帮助
    fpr         显示密钥指纹
    grip        显示 keygrip
    list        列出密钥和用户标识
    uid         选择用户标识 N
    key         选择子密钥 N
    check       检查签名
    sign        为所选用户标识添加签名 [* 参见下面的相关命令]
    lsign       为所选用户标识添加本地签名
    tsign       为所选用户标识添加信任签名
    nrsign      为所选用户标识添加不可吊销签名
    adduid      增加一个用户标识
    addphoto    增加一个照片标识
    deluid      删除选定的用户标识
    addkey      增加一个子密钥
    addcardkey  增加一个密钥到智能卡
    keytocard   移动一个密钥到智能卡
    bkuptocard  移动一个备份密钥到智能卡上
    delkey      删除选定的子密钥
    addrevoker  增加一个吊销用密钥
    delsig      从所选用户标识上删除签名
    expire      变更密钥或所选子密钥的使用期限
    primary     标记所选的用户标识为主要
    pref        列出偏好设置（专家模式）
    showpref    列出偏好设置（详细模式）
    setpref     为所选用户标识设定偏好设置列表
    keyserver   为所选用户标识设定首选公钥服务器 URL
    notation    为所选用户标识的设定注记
    passwd      变更密码
    trust       变更信任度
    revsig      吊销所选用户标识上的签名
    revuid      吊销选定的用户标识
    revkey      吊销密钥或选定的子密钥
    enable      启用密钥
    disable     禁用密钥
    showphoto   显示选定的照片标识
    clean       压缩不可用的用户标识并从密钥上移除不可用的签名
    minimize    压缩不可用的用户标识并从密钥上移除所有签名

    * ‘sign’命令可以通过‘l’前缀（lsign）进行本地签名，‘t’前缀（tsign）进行
      信任签名，‘nr’前缀（nrsign）进行不可吊销签名，
      或者上述三种前缀的任意组合（ltsign、tnrsign 等）。

#### 三、应用

##### 加密与解密

    $ gpg -r filename.asc -e filename               # 使用公钥文件对 filename 加密，生成二进制 filename.pgp
    $ gpg -r KEY_ID -o filename.asc -ea filename    # 同上，不过以 ASCII 方式输入结果，并输出 asc 文件
    $ gpg -o filename -d filename.pgp               # 对 filename.pgp 解密，保存为 filename

##### 打包方式进行签名与验证

    $ gpg -s filename                   # 使用默认的用户对 filename 进行打包方式的签名
    $ gpg -u KEY_ID -s filename         # 使用指定的用户 KEY_ID  对 filename 进行签名
    $ gpg --verify filename.gpg         # 验证签名
    $ gpg -o filename -d filename.gpg   # 解包并验证签名

##### 分离方式进行签名与验证

    $ gpg -sb filename
    $ gpg -u KEY_ID -sb filename
    $ gpg --verify filename.sig filename

##### 签名并加密

    $ gpg -r KEY_ID -es filename                    # 使用指定的公钥进行加密并签名，生成的二进制文件是 filename.gpg
    $ gpg -r KEY_ID -o filename.asc -esa filename   # 同上，加上以 ASCII 编码

###### 签名加密时常用参数

     -s, --sign                 # 签名
     -b, --detach-sign          # 分离式签名，文件与签名分开
     -e, --encrypt              # 加密
     -d, --decrypt              # 解密
     -a, --armor                # ascii 编码输出，一般与 -o file 搭配
     -o, --output FILE          # 输出文件
     -r, --recipient USER-ID    # 以特定的 ID 去加密
     -u, --local-user USER-ID   # 以特定的 ID 去签名或解密

##### 作为 ssh 公钥

如果想将 gpg 作为 ssh 公钥，则在创建子钥的时候，需要创建一个 [A] 用途的专用子钥。

编辑 **~/.gnupg/gpg-agent.conf**，加入

    enable-ssh-support

编辑你的 **~/.bashrc** 或 **~/.zshrc**，加入如下，并最后重新载入下 **source ~/.bashrc** 或 **source ~/.zshrc**，原本写入 ssh-agent 相关的内容，也可以注释掉了

    [[ -f /usr/bin/gpg-agent ]] && export GPG_TTY=$(tty)
    [[ -n "$SSH_CONNECTION" ]] && export PINENTRY_USER_DATA="USE_CURSES=1"
    unset SSH_AGENT_PID
    if [ "${gnupg_SSH_AUTH_SOCK_by:-0}" -ne $$ ]; then
        export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)
    fi

编辑 **~/.ssh/config**，加入

    Match host * exec "gpg-connect-agent updatestartuptty /bye > /dev/null"

获取子钥的 keygrip

    $ gpg --with-keygrip --list-key KEY_ID

将对应子匙的 keygrip 插入到 **~/.gnupg/sshcontrol** 中

    $ echo xxxxxxyour-keygripxxxxxx >> ~/.gnupg/sshcontrol

重启下 gpg-agent

    $ gpg-connect-agent reloadagent /bye

接下来就可以检查下，ssh 验证列表中，是否存在公钥了

    $ ssh-add -l

最后将上面的公钥添加到你的远程服务器，或 github 的 gpg 列表中即可

###### 针对 github

如果有多个项目处于 github 的不同账户中，你可能需要针对不同项目配置不同的密钥

    gpg --export-ssh-key subkey! > .ssh/repo-1
    git config --local core.sshCommand "ssh -i ~/.ssh/repo-1"   # 项目文件夹内执行

##### mutt 中的使用

复制 mutt 示例配置文件至 mutt 配置目录

    $ cp /usr/share/doc/mutt/examples/gpg.rc ~/.mutt/

并在其最后加入

    set pgp_autosign=yes
    set pgp_replysign=yes
    set pgp_replyencrypt=yes
    set pgp_sign_as=KEYID       # 你自己的公钥标志 ID
    set pgp_timeout=60
    set pgp_verify_sig=yes

编辑 `~/.mutt/muttrc`，加入如下行

    $ source ~/.mutt/gpg.rc

thunderbird 中只需安装 Enigmail 扩展即可，支持 gnupg，可视化的配置就不多说了。

参考：

- [http://www.gnupg.org/documentation/guides.en.html](http://www.gnupg.org/documentation/guides.en.html)
- [http://codesorcery.net/old/mutt/mutt-gnupg-howto](http://codesorcery.net/old/mutt/mutt-gnupg-howto)
