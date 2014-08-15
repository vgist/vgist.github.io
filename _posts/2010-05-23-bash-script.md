---
layout: post
title: "写个简单的 Bash 脚本"
description: "脚本是关于 lnmp 或者 llmp 的启动相关的，适用于 archlinux"
keywords: "bash, 脚本, lnmp, arch, linux"
category: Internet
tags: [lnmp, CLI]
---

脚本是关于 lnmp 或者 llmp 的启动相关的，适用于 archlinux。

因为工作环境是 arch，而又经常玩http环境，于是有了这个脚本。

用法很简单，root 权限运行 http，按照提示输入数字即可。

<!-- more -->

```sh
#!/bin/bash
#
    
#==================
start_mysql() {
    printf "Starting MySQL...\n"
    /etc/rc.d/mysqld start
}
stop_mysql() {
    printf "Stopping MySQL...\n"
    /etc/rc.d/mysqld stop
}
restart_mysql() {
    printf "Restarting MySQL...\n"
    /etc/rc.d/mysqld restart
}
start_php() {
    printf "Starting PHP-FPM...\n"
    ulimit -SHn 65535
    /etc/rc.d/php-fpm start
}
stop_php() {
    printf "Stopping PHP-FPM...\n"
    /etc/rc.d/php-fpm stop
}
restart_php() {
    printf "Restarting PHP-FPM...\n"
    /etc/rc.d/php-fpm restart
}
start_apache2() {
    printf "Starting Apache2...\n"
    /etc/rc.d/httpd start
}
stop_apache2() {
    printf "Stopping Apache2...\n"
    /etc/rc.d/httpd stop
}
restart_apache2() {
    printf "Restarting Apache2...\n"
    /etc/rc.d/httpd restart
}
start_nginx() {
    printf "Starting Nginx...\n"
    /etc/rc.d/nginx start
}
stop_nginx() {
    printf "Stopping Nginx...\n"
    /etc/rc.d/nginx stop
}
restart_nginx() {
    printf "Restarting Nginx...\n"
    /etc/rc.d/nginx restart
}
start_lighttpd() {
    printf "Starting LigHttpd...\n"
    /etc/rc.d/lighttpd start
}
stop_lighttpd() {
    printf "Stopping LigHttpd...\n"
    /etc/rc.d/lighttpd stop
}
restart_lighttpd() {
    printf "Restarting LigHttpd...\n"
    /etc/rc.d/lighttpd restart
}
#==================
    
echo "Choose instance:"
echo "1. nginx + php-fpm + mysqld + postfix"
echo "2. lighttpd + php-fpm + mysqld + postfix"
echo "3. apache2 + php + mysql + postfix"
read num
    case $num in
        1)
            echo "nginx + php-fpm + mysqld"
            echo "Choose instance:"
            echo "1. start"
            echo "2. stop"
            echo "3. restart"
            read num
                case $num in
                    1)
                        start_mysql
                        start_php
                        start_nginx
                        ;;
                    2)
                        stop_mysql
                        stop_php
                        stop_nginx
                        ;;
                    3)
                        restart_mysql
                        restart_php
                        restart_nginx
                        ;;
                    *)
                        echo "Wrong number, please re-run and choose again."
                        ;;
                esac
            exit 0
            ;;
        2)
            echo "lighttpd + php-fastcgi + mysqld"
            echo "Choose instance:"
            echo "1. start"
            echo "2. stop"
            echo "3. restart"
            read num
                case $num in
                    1)
                        start_mysql
                        start_lighttpd
                        ;;
                    2)
                        stop_mysql
                        stop_lighttpd
                        ;;
                    3)
                        restart_mysql
                        restart_lighttpd
                        ;;
                    *)
                        echo "Wrong number, please re-run and choose again."
                        ;;
                esac
            exit 0
            ;;
        3)
            echo "apache2 + php + mysqld"
            echo "Choose instance:"
            echo "1. start"
            echo "2. stop"
            echo "3. restart"
            read num
                case $num in
                    1)
                        start_mysql
                        start_apache2
                        ;;
                    2)
                        stop_mysql
                        stop_apache2
                        ;;
                    3)
                        restart_mysql
                        restart_apache2
                        ;;
                    *)
                        echo "Wrong number, please re-run and choose again."
                        ;;
                esac
            exit 0
            ;;
        *)
            echo " Wrong number, please re-run and choose again."
            ;;
    esac
exit 0
    
# vim:set ts=4 sw=4 ft=sh et:
```
