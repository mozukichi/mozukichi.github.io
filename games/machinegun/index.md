---
layout: page
title: "マシンガン"
description: "クリック連打で敵を倒すゲーム"
tags: game
---
{% include JB/setup %}

Windows用フリーゲーム「マシンガン　リメイク」のブラウザ版です。JavaScript, CanvasElement, AudioElement, Web Audio APIなどを使っています。

クリック連打で敵を倒してください。

<div style='margin: 0 auto; width: 640px;'>
<canvas id='canvas' width='640px' height='480px' style='background-color: black;'></canvas>
</div>
<script type='text/javascript'>
    var script = document.createElement('script');
    script.src = 'machinegun.js?' + (new Date).getTime();
    document.body.appendChild( script );
</script>

## 遊び方

とにかくクリック連打だ！！
