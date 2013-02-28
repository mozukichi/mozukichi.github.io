---
layout: page
title: "マシンガン"
description: "クリック連打で敵を倒すゲーム"
tags: game
---
{% include JB/setup %}

2001年に製作した「真々厳（マシンガン）」を2005年にリメイクした「マシンガン　リメイク」を2013年にWeb移植したぞ！！

JavaScript, CanvasElement, AudioElement, Web Audio APIなどを使っていますので、Chromeなどのモダンなブラウザでお遊びください。

クリック連打で敵を倒してください。

<div style='margin: 0 auto; width: 640px;'>
<canvas id='canvas' width='640px' height='480px' style='background-color: black;'></canvas>
</div>
<script type='text/javascript'>
    var script = document.createElement('script');
    script.src = 'machinegun.js?' + (new Date).getTime();
    document.body.appendChild( script );
</script>

ページ下部に、遊び方やゲームの攻略情報が載っているぞ！

## アンケートにご協力ください

<iframe id="enquete" src="https://docs.google.com/forms/d/17dNdDShDLlAk_jbnBrwYrkNt8LxCmH8jcxp0r4KMV2k/viewform?embedded=true" width="760" height="730" frameborder="0" marginheight="0" marginwidth="0" scrolling="no">読み込み中...</iframe>

## 遊び方

「レディー」「ゴー！」となったら、３秒間とにかくクリック連打だ！！

### 攻撃力

攻撃中のクリック回数と、ランダムに上昇する倍率によって相手に与えるダメージが決まるぞ！

### 聖なる力

クリック回数30回を超えた分だけ聖なる力が溜まるぞ！

以下の条件で聖なる力の効果が開放されるぞ！

|種類|聖なる力の量
|--|--|
|聖なる力１|20以上
|聖なる力２|30以上
|聖なる力３|40以上
|聖なる力４|50(最大)

#### 聖なる力１ 

- 敵に与えるダメージが少し増えるぞ！
- 敵から受けるダメージが少し減るぞ！

#### 聖なる力２

特に何も起こらない。絵が出るだけ。

#### 聖なる力３

ランダムに上昇する倍率が増える確率が上がるぞ！

#### 聖なる力４

- 敵に与えるダメージがけっこう増えるぞ！
- 敵から受けるダメージがけっこう減るぞ！
- 自分のHPが全回復するぞ！（聖なる力４を手に入れた時点でのみ）

### 自分の最大HPの上昇

聖なる力が溜まると、自分の最大HPが上昇していき、その分HPも回復するぞ！

### 裏ステージ

聖なる力が最大の50の状態で最終回戦の敵を倒すと、裏ステージに行けるぞ！
