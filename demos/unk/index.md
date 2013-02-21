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

<script type='text/javascript' src='unk.js'></script>
<script type='text/javascript'>
    var content = document.body.getElementsByClassName('content')[0];
    content.appendChild(Core.errorDisp);

    Core.initialize();
    content.appendChild(Core.canvas);
    Core.scene = Game.scenes.title;
</script>
