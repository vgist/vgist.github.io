---
layout: post
title: "CSS 的预处理器 SASS"
description: "sass 的一些介绍"
keywords: "scss, css"
category: Internet
tags: [style]
---
{% include JB/setup %}

最近经常接触 [Jekyll](http://jekyllrb.com/)，进而又认识到 [Sass](http://sass-lang.com/)（从 Sass 3 开始的新语法规则被称为 SCSS，之前的语法规则为 Syntaxes） 这个 CSS 的处理器，同时 [Compass](http://compass-style.org/) 又是一个高效的开发 SASS 的利器。

闲话少说，安装

    $ gem install sass
    $ gem install compass

<!-- more -->
创建一个新项目

    $ compass create .

其中 config.rb 文件可以对之进行一些修改，譬如输出格式

```
:nested		# 默认值，嵌套缩进
:expanded	# 无缩进、扩展
:compact	# 简洁格式
:compressed	# 压缩后
```

实时监控 Sass 目录，使之修改保存后，即可编译成对应目录的 css 

    $ compass watch .

最后，提交到代码库时，将 **.sass-cache** 写入 **.gitignore**

以下是关于 SASS 的具体用法，转自：[SASS用法指南 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2012/06/sass.html)

- - -

### 一、什么是SASS

SASS 是一种 CSS 的开发工具，提供了许多便利的写法，大大节省了设计者的时间，使得 CSS 的开发，变得简单和可维护。

本文总结了 SASS 的主要用法。我的目标是，有了这篇文章，日常的一般使用就不需要去看[官方文档](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html)了。

### 二、安装和使用

#### 2.1 安装

SASS 是 Ruby 语言写的，但是两者的语法没有关系。不懂 Ruby，照样使用。只是必须先[安装 Ruby](http://www.ruby-lang.org/zh_cn/downloads/)，然后再安装 SASS。

假定你已经安装好了Ruby，接着在命令行输入下面的命令：

    gem install sass

然后，就可以使用了。

#### 2.2 使用

SASS 文件就是普通的文本文件，里面可以直接使用 CSS 语法。文件后缀名是 `.scss`，意思为 **Sassy CSS**。

下面的命令，可以在屏幕上显示 `.scss` 文件转化的 css 代码。（假设文件名为test。）

    sass test.scss

如果要将显示结果保存成文件，后面再跟一个 .css 文件名。

    sass test.scss test.css

SASS 提供四个[编译风格](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#output_style)的选项：

    * nested：嵌套缩进的css代码，它是默认值。
    * expanded：没有缩进的、扩展的css代码。
    * compact：简洁格式的css代码。
    * compressed：压缩后的css代码。

生产环境当中，一般使用最后一个选项。

    sass --style compressed test.sass test.css

你也可以让 SASS 监听某个文件或目录，一旦源文件有变动，就自动生成编译后的版本。

    // watch a file
    sass --watch input.scss:output.css
    // watch a directory
    sass --watch app/sass:public/stylesheets

SASS 的官方网站，提供了一个[在线转换器](http://sass-lang.com/try.html)。你可以在那里，试运行下面的各种例子。

### 三、基本用法

#### 3.1 变量

SASS 允许使用变量，所有变量以 `$` 开头。

    $blue : #1875e7;　
    div {
      color : $blue;
    }

如果变量需要镶嵌在字符串之中，就必须需要写在 `#{}` 之中。

    $side : left;
    .rounded {
      border-#{$side}-radius: 5px;
    }

3.2 计算功能

SASS 允许在代码中使用算式：

    body {
      margin: (14px/2);
      top: 50px + 100px;
      right: $var * 10%;
    }

3.3 嵌套

SASS 允许选择器嵌套。比如，下面的 CSS 代码：

    div h1 {
      color : red;
    }

可以写成：

    div {
      hi {
        color:red;
      }
    }

属性也可以嵌套，比如 `border-color` 属性，可以写成：

    p {
      border: {
        color: red;
      }
    }

注意，border 后面必须加上冒号。

在嵌套的代码块内，可以使用 `$` 引用父元素。比如 `a:hover` 伪类，可以写成：

    a {
      &:hover { color: #ffb3ff; }
    }

#### 3.4 注释

SASS 共有两种注释风格。

标准的 CSS 注释 `/* comment */` ，会保留到编译后的文件。

单行注释 `// comment`，只保留在 SASS 源文件中，编译后被省略。

在 `/*` 后面加一个感叹号，表示这是"重要注释"。即使是压缩模式编译，也会保留这行注释，通常可以用于声明版权信息。

    /*!
      重要注释！
    */

### 四、代码的重用

#### 4.1 继承

SASS 允许一个选择器，继承另一个选择器。比如，现有 class1：

    .class1 {
      border: 1px solid #ddd;
    }

class2 要继承 class1，就要使用 `@extend` 命令：

    .class2 {
      @extend .class1;
      font-size:120%;
    }

#### 4.2 Mixin

Mixin 有点像 C 语言的宏 ( macro )，是可以重用的代码块。

使用 `@mixin` 命令，定义一个代码块。

    @mixin left {
      float: left;
      margin-left: 10px;
    }

使用 `@include` 命令，调用这个 mixin。

    div {
      @include left;
    }

mixin 的强大之处，在于可以指定参数和缺省值。

    @mixin left($value: 10px) {
      float: left;
      margin-right: $value;
    }

使用的时候，根据需要加入参数：

    div {
      @include left(20px);
    }

下面是一个 mixin 的实例，用来生成浏览器前缀。

    @mixin rounded($vert, $horz, $radius: 10px) {
      border-#{$vert}-#{$horz}-radius: $radius;
      -moz-border-radius-#{$vert}#{$horz}: $radius;
      -webkit-border-#{$vert}-#{$horz}-radius: $radius;
    }

使用的时候，可以像下面这样调用：

    #navbar li { @include rounded(top, left); }
    #footer { @include rounded(top, left, 5px); }

#### 4.3 颜色函数

SASS 提供了一些内置的颜色函数，以便生成系列颜色。

    lighten(#cc3, 10%) // #d6d65c
    darken(#cc3, 10%) // #a3a329
    grayscale(#cc3) // #808080
    complement(#cc3) // #33c

#### 4.4 插入文件

`@import` 命令，用来插入外部文件。

    @import "path/filename.scss";

如果插入的是 `.css` 文件，则等同于 css 的 import 命令。

    @import "foo.css";

### 五、高级用法

#### 5.1 条件语句

`@if` 可以用来判断：

    p {
      @if 1 + 1 == 2 { border: 1px solid; }
      @if 5 < 3 { border: 2px dotted; }
    }

配套的还有 `@else` 命令：

    @if lightness($color) > 30% {
      background-color: #000;
    } @else {
      background-color: #fff;
    }

#### 5.2 循环语句

SASS 支持 for 循环：

    @for $i from 1 to 10 {
      .border-#{$i} {
        border: #{$i}px solid blue;
      }
    }

也支持 while 循环：

    $i: 6;
    @while $i > 0 {
      .item-#{$i} { width: 2em * $i; }
      $i: $i - 2;
    }

each 命令，作用与 for 类似：

    @each $member in a, b, c, d {
      .#{$member} {
        background-image: url("/image/#{$member}.jpg");
      }
    }

#### 5.3 自定义函数

SASS 允许用户编写自己的函数。

    @function double($n) {
      @return $n * 2;
    }

    #sidebar {
      width: double(5px);
    }

（完）
