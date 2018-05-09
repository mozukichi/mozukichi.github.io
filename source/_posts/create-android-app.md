---
title: "Androidアプリ開発"
date: 2013-8-2
---

Mac OS XにてAndroid SDKプログラミング。JDK(ant付属)がインストールされている前提。

## Android SDKの取得

Android SDKは以下のページからダウンロード可能。（2013/08/02現在）

=> [Android SDK | Android Developers](http://developer.android.com/intl/ja/sdk/index.html)

上記リンクからAndroid SDKをダウンロードし、適当な場所に展開。（自分は /usr/local/以下に置きました。）

Android SDKが置かれた場所のパスを`$ANDROID_HOME`とする。

[Android Studio](http://developer.android.com/intl/ja/sdk/installing/studio.html)というのが公開されて、ちょっといじってみたけど、まだ様子見しておく。あとあといじり倒すかもしれないけど。


## Androidアプリのプロジェクトの作成

Android SDKに、プロジェクトのスケルトンを作成するためのツールがある。`$ANDROID_HOME/tools/android`コマンド。`$ANDROID_HOME/tools`にパスを通しておいた方がいいのかな。パスを通した前提で進める。

まず、プロジェクトのディレクトリを作成し、その中で`android create project`してプロジェクトのスケルトンを作成。コマンドに対しては、細かめのオプションを設定する必要がある。

### android create project

<pre>$ mkdir androidproject
$ cd androidproject
$ android create project
</pre>

`android create project`とだけ叩くと、以下のような「これらのオプション入れてーな」っていう案内が出てくる。

<pre>  -n --name    : Project name.
  -t --target  : Target ID of the new project. [required]
  -p --path    : The new project's directory. [required]
  -k --package : Android package name for the application. [required]
  -a --activity: Name of the default Activity that is created. [required]
</pre>

### --name

`-n`もしくは`--name`には、プロジェクト名を入れる。

### --target

`--target`に何を入れればいいのか？を調べるには、`android list targets`すると、ヒントをくれる。

<pre>$ android list targets</pre>

出力される内容はたくさんあるので、ここでは省略。`-c`もしくは`--compact`オプションをつけることで、少なめの情報で出力してくれる。

<pre>$ android list targets -c
android-8
Google Inc.:Google APIs:8
KYOCERA Corporation:DTS Add-On:8
LGE:Real3D Add-On:8
Samsung Electronics Co., Ltd.:GALAXY Tab Addon:8
android-10
Google Inc.:Google APIs:10
Intel Corporation:Intel Atom x86 System Image:10
KYOCERA Corporation:DTS Add-On:10
LGE:Real3D Add-On:10
Sony Mobile Communications AB:EDK 2.0:10
android-16
Google Inc.:Google APIs:16
android-17
Google Inc.:Google APIs:17
</pre>

`--target`には、IDかターゲット名(android-8など)を指定する。それそれのターゲットがどういう意味なのかは察して下さい。[What's API Level?](http://developer.android.com/intl/ja/guide/topics/manifest/uses-sdk-element.html#ApiLevels)や[Dashboards | Android Developers](http://developer.android.com/intl/ja/about/dashboards/index.html)を見れば、思うところがあるかもしれない。

### --path

`-p`もしくは`--path`には、プロジェクトのファイルをどこに作成するのかをパスで指定する。先程の例だと、すでにディレクトリを作成し、そのディレクトリに入っているので、`.`を指定する。

### --package

`-k`もしくは`--package`には、パッケージ名を指定する。Androidアプリを識別するための名前のようなもの。

=> [パッケージ (Java) - Wikipedia](http://ja.wikipedia.org/wiki/%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8_\(Java\))

こちらのページが参考になる。

### --activity

`-a`もしくは`--activity`には、デフォルトで実行するActivityクラスのクラス名を指定する。実行可能なAndroidアプリには、必ず1つ以上のActivityクラスが必要(要出典)になる。

### android create projectの実行

<pre>$ android create project --name AndroidProject --target android-8 --path . --package com.zukkun.androidproject --activity MainActivity</pre>

実行すると、以下のような出力がされる。

<pre>Created directory /Users/zukkun/projects/androidproject/src/com/zukkun/androidproject
Added file ./src/com/zukkun/androidproject/MainActivity.java
Created directory /Users/zukkun/projects/androidproject/res
Created directory /Users/zukkun/projects/androidproject/bin
Created directory /Users/zukkun/projects/androidproject/libs
Created directory /Users/zukkun/projects/androidproject/res/values
Added file ./res/values/strings.xml
Created directory /Users/zukkun/projects/androidproject/res/layout
Added file ./res/layout/main.xml
Added file ./AndroidManifest.xml
Added file ./build.xml
Added file ./proguard-project.txt
</pre>

プロジェクトのスケルトンファイルをもりもり作ってくれた。では、さっそくantでビルドしてみよう。

## アプリ名を設定しよう

生成されたファイルの中で、res/values/strings.xmlというXMLファイルがあるので、これを開いてみる。

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MainActivity</string>
</resources>
```

ここで`<string name="app_name">MainActivity</string>`となっている部分の、`MainActivity`を好きなアプリ名に書き換える。

```xml
    <string name="app_name">あんどろいど！</string>
```

## antでビルドしてみよう

デバッグビルド。

<pre>$ ant debug</pre>

`BUILD SUCCESSFUL`が出たら成功。binディレクトリが作成されていて、その中にapkファイルが生成される。`ant debug`していた場合は、AndroidProject-debug.apkというファイルが作成されている。

## アプリを実行

ビルドに成功したら、Android EmulatorかAndroid実機にインストールして、実行してみよう。

実機での設定や、Android Emulatorでの実行のための作業等については割愛。

<pre>$ ant installd</pre>

インストールされると、アプリ一覧にアイコンが追加される。

![](/images/android-2013-08-02-01.png)

アイコンをタップして実行。

![](/images/android-2013-08-02-02.png)

## ソースコード

生成されたファイルの中のsrc/com/zukkun/androidproject/の中にあるMainActivity.javaが実行されるActivityクラスのソースコード。中身はこのようになっている。

```java
package com.zukkun.androidproject;

import android.app.Activity;
import android.os.Bundle;

public class MainActivity extends Activity
{
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
    }
}
```

こいつをゴニョゴニョして、あれしたり、これしたりする。
