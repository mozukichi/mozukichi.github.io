---
layout: page
title: UNK
description: TagChat ゲームプログラミング（笑）コミュニティ　新春ゲームプログラミング（笑）一発芸大会　提出作品
header: UNK
tags: demo
---
{% include JB/setup %}

TagChat ゲームプログラミング（笑）コミュニティ

新春ゲームプログラミング（笑）一発芸大会 提出作品

<div id='demo-content'></div>

<script type='text/javascript' src='unk.js'></script>
<script type='text/javascript'>
    var content = document.getElementById('demo-content');
    content.appendChild(Core.errorDisp);

    Core.initialize();
    content.appendChild(Core.canvas);
    Core.scene = Game.scenes.title;
</script>

## 動作確認

- Mac / Chrome 24.0.1312.57

## Release Note

### 2013-1-25

- 修正

### 2013-1-24

- 公開開始
