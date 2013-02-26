/**
 * @fileoverview マシンガン
 * @author zukkun
 */

// 各種ブラウザ固有でのオブジェクトが存在するかチェック
function checkObject( objname ) {
	var prefix = ['webkit', 'moz', 'o', 'ms'];
	if ( window[objname] ) return window[objname];
	for ( var i in prefix ) {
		var obj = window[prefix[i] + objname];
		if ( obj ) return obj;
	}
	return null;
}

var game = {};
game.canvas = null;
game.ctx = null;

// 敵の名前
game.eneName = ["アオス","北白豚","ただし","オニ君","おたま","ピン子"];

// 画像データ
game.imageBack = null;
game.imagePlayer = null;
game.imageEnemy = null;
game.imageLogo = null;
game.imageTitle = null;
game.imageBuf = null;
game.imageChikara = null;

// 効果音データ
game.sounds = [];
game.playerVoice = [];
game.enemyVoice = [];

// 音楽データ
game.music = null;

// ゲームモード内フェーズ
game.phase = 0;
// 待ち時間用
game.wait = 0;

// ゲーム用変数の宣言
game.curGameMode = null;
game.gamemodes = {};
game.stage = 0;
game.player = {
	HP: 0, maxHP: 1000, bai: 1,
	chikara: [], power: 0, zenkai: false
};
game.player.enableAtt = false;
game.enemy = {
	HP: 0, maxHP: 0, bai: 1
};
game.info = [];
game.info[0] = '';
game.info[1] = '';
game.info[2] = '';
game.enableRenderGame = false;

game.endingText = [];

/**
 * 画像の読み込み
 * @function
 */
game.loadImage = function( src ) {
	var obj = document.createElement('image');
	if ( obj ) {
		obj.src = src;
	}
	return obj;
};

/**
 * サウンドの読み込み
 * @function
 */
game.loadSound = function( src ) {
	var obj = {};
	obj.complete = false;
	if ( game.audioCtx ) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', src, true);
		xhr.responseType = 'arraybuffer';
		xhr.onreadystatechange = function() {
			if ( xhr.readyState == 4 && xhr.status == 200 ) {
				obj.data = game.audioCtx.createBuffer(xhr.response, false);
				obj.play = function(){
					var source = game.audioCtx.createBufferSource();
					source.connect(game.audioCtx.destination);
					source.buffer = obj.data;
					var playTime = game.audioCtx.currentTime;
					source.noteOn(playTime);
					obj.lastPlayTime = playTime;
				};
				obj.isPlaying = function() {
					return obj.lastPlayTime + obj.data.duration > game.audioCtx.currentTime;
				};
				obj.complete = true;
			}
		};
		xhr.send();
	} else {
		obj.data = document.createElement('audio');
		obj.onload = function(){
			obj.play = function(){ obj.data.play(); };
			obj.complete = true;
		};
		obj.isPlaying = function() {
			return !obj.data.paused;
		};
		obj.data.src = src;
	}
	return obj;
};

/**
 * 音楽の読み込み
 * @function
 */
game.loadMusic = function( src ) {
	game.canplaymusic = false;
	if ( src && game.music ) {
		game.music.src = src;
		game.music.load();
	}
};
/**
 * 音楽の再生
 * @function
 */
game.playMusic = function( loop ) {
	if ( game.music && game.canplaymusic ) {
		if ( loop ) {
			game.music.loop = true;
		} else {
			game.music.loop = false;
		}
		game.music.play();
	}
};
game.canplaymusic = false;
game.isCanPlayMusic = function() {
	return game.canplaymusic;
};

/**
 * 音楽の停止
 * @function
 */
game.stopMusic = function() {
	if ( game.music ) {
		game.music.pause();
		game.music.src = null;
	}
};

/**
 * 入力管理
 */
game.input = {};
game.input.clickCount = 0; // クリック回数カウント用
game.input.clickReset = function(){game.input.clickCount = 0;};
game.input.mouse = {};
game.input.mouse.first = false;
game.input.mouse.press = false;
game.input.mouse.release = false;
game.input.mouse.onclick = null;
window.addEventListener('mousedown',function(e){
	if ( e.button == 0 ) {
		game.input.mouse.press = true;
		if ( game.player.enableAtt ) {
			++game.input.clickCount;
		}
		if ( game.input.onclick ) game.input.onclick();
	}
});
window.addEventListener('mouseup',function(e){
	if ( e.button == 0 ) {
		game.input.mouse.release = true;
	}
});
game.input.mouse.update = function() {
	var mouse = game.input.mouse;
	if ( mouse.first ) mouse.first = false;
	if ( mouse.press ) mouse.first = true;
	if ( !mouse.press && mouse.release ) mouse.release = false;
	if ( mouse.release ) {
		mouse.press = false;
	}
};
// フルスクリーン化処理
window.addEventListener('keydown', function(e){
	if ( e.keyCode == 70 ) {
		game.canvas.webkitRequestFullScreen();
	}
});

/**
 * テロップの表示
 * フェードイン   0.25秒
 * 待ち           1.75秒
 * フェードアウト 0.25秒
 * @function
 */
game.telop = {};
game.telop.text = '';
game.telop.showing = false;
game.telop.time = 0.0;
game.telop.show = function( text ) {
	game.telop.text = text;
	game.telop.state = 0;
	game.telop.time = 0.3;
	game.telop.showing = true;
};
game.telop.update = function( elapsedTime ) {
	if ( game.telop.time <= 0.0 ) return;
	game.telop.time -= elapsedTime;
	if ( game.telop.time < 0.0 ) {
		switch ( game.telop.state ) {
			case 0:
				++game.telop.state;
				game.telop.time = 0.25;
				break;
			case 1:
				++game.telop.state;
				game.telop.time = 1.75;
				break;
			case 2:
				++game.telop.state;
				game.telop.time = 0.25;
				break;
			case 3:
				game.telop.state = 0;
				game.telop.time = 0.0;
				break;
		}
	}
};
game.telop.isFinished = function() {
	return game.telop.time <= 0.0;
};
game.telop.render = function() {
	var canvas = game.canvas;
	var ctx = game.ctx;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'white';
	ctx.font = '32px monospace';
	switch ( game.telop.state ) {
		case 1: ctx.globalAlpha = 1.0 - ( game.telop.time / 0.25 ); break;
		case 2: ctx.globalAlpha = 1.0; break;
		case 3: ctx.globalAlpha = game.telop.time / 0.25; break;
	}
	if ( game.telop.state > 0 ) {
		ctx.fillText(game.telop.text, canvas.width / 2, canvas.height / 2);
	}
	ctx.globalAlpha = 1.0;
};

/**
 * トランジション
 */
game.transition = {};
game.transition.image = null;
game.transition.MODE = { NONE: 0, SHOW:1, HIDE: 2, SHOW_END: 3, HIDE_END: 4 };
game.transition.curMode = game.transition.MODE.NONE;
game.transition.time = 0;
game.transition.targetPos = null;
game.transition.isFinished = function() {
	return ( game.transition.curMode == game.transition.MODE.NONE ) ||
		( game.transition.curMode == game.transition.MODE.SHOW_END ) ||
		( game.transition.curMode == game.transition.MODE.HIDE_END );
};
game.transition.show = function( image ) {
	if ( !image ) { return; }
	game.transition.image = image;
	game.transition.targetPos = [];
	for ( var x = 0; x < 10; x++ ) {
		game.transition.targetPos[x] = [];
		for ( var y = 0; y < 10; y++) {
			var pos = {};
			pos.x = Math.floor( Math.random() * 320 + 640 );
			pos.y = Math.floor( Math.random() * 320 + 480 );
			game.transition.targetPos[x][y] = pos;
		}
	}

	game.transition.curMode = game.transition.MODE.SHOW;
	game.transition.time = 0;
};
game.transition.hide = function( image )
{
	if ( !image) { return; }
	game.transition.image = image;
	game.transition.targetPos = [];
	for ( var x = 0; x < 10; x++ ) {
		game.transition.targetPos[x] = [];
		for ( var y = 0; y < 10; y++) {
			var pos = {};
			pos.x = Math.floor( Math.random() * 320 + 640 );
			pos.y = Math.floor( Math.random() * 320 + 480 );
			game.transition.targetPos[x][y] = pos;
		}
	}

	game.transition.curMode = game.transition.MODE.HIDE;
	game.transition.time = 0;
};
game.transition.update = function( elapsedTime ) {
	if ( game.transition.curMode == game.transition.MODE.SHOW_END ||
		 game.transition.curMode == game.transition.MODE.HIDE_END ) {
		game.transition.curMode = game.transition.MODE.NONE;
		game.transition.image = null;
	} else {
		if ( game.transition.time >= 0.8 ) {
			if ( game.transition.curMode == game.transition.MODE.SHOW ) {
				game.transition.curMode = game.transition.MODE.SHOW_END;
			} else {
				game.transition.curMode = game.transition.MODE.HIDE_END;
			}
		}
		game.transition.time += elapsedTime;
		if ( game.transition.time > 0.8 ) {
			game.transition.time = 0.8;
		}
	}
};
game.transition.render = function() {
	if ( !game.transition.image ) {
		return;
	}

	var rate = 0;
	var p1 = {};
	var p2 = {};
	var ctx = game.ctx;

	switch ( game.transition.curMode ) {
		case game.transition.MODE.NONE:
			return;
		case game.transition.MODE.SHOW:
			rate = 1.0 - ( game.transition.time / 0.8 );
			break;
		case game.transition.MODE.HIDE:
			rate = ( game.transition.time / 0.8 );
			break;
		case game.transition.MODE.SHOW_END:
			ctx.drawImage( game.transition.image, 0, 0 );
			return;
		case game.transition.MODE.HIDE_END:
			return;
	}

	for ( var x = 0; x < 10; x++ ) {
		for ( var y = 0; y < 10; y++ ) {
			game.transition.targetPos[x][y].y += 10;

			if ( game.transition.targetPos[x][y].y >= 640 ) {
				game.transition.targetPos[x][y].y -= 640;
			}

			var pos = game.transition.targetPos[x][y];
			p1.x = Math.floor( x * 64 + ( pos.x * rate ) * Math.cos( pos.y * Math.PI / 480 ) );
			p1.y = Math.floor( y * 48 + ( pos.x * rate ) * Math.sin( pos.y * Math.PI / 480 ) );

			p2.x = Math.floor( x * 64 );
			p2.y = Math.floor( y * 48 );

			ctx.drawImage( game.transition.image, p2.x, p2.y, 64, 48, p1.x, p1.y, 64, 48 );
		}
	}
}

/**
 * ステージごとのリソースの読み込み
 * @function
 */
game.loadStageResources = function( stage ) {
	// 画像の読み込み
	game.imageBack = game.loadImage( 'images/back' + (stage + 1) + '.jpg' );
	game.imageEnemy = game.loadImage( 'images/chara' + (stage + 2) + '.png' );
	// ボイスの読み込み
	for ( var i = 0; i < 6; ++i ) {
		game.enemyVoice[i] = game.loadSound('sounds/voice' + (6 + stage * 6 + i + 1) + '.ogg');
	}
};

/**
 * ステージのリソースが読み込まれたか確認
 * @function
 */
game.isStageResourcesLoadComplete = function() {
	var res = [ game.imageBack, game.imageEnemy ];
	for ( var i in game.enemyVoice ) {
		res.push( game.enemyVoice[i] );
	}
	var complete = true;
	for ( var i in res ) {
		if ( res[i].complete == false ) complete = false;
	}
	return complete;
};

/**
 * ゲームの初期化
 * @funtion
 */
game.init = function() {
	// 2D Context の取得
	var canvas = document.getElementById('canvas');
	if ( !canvas || !canvas.getContext ) {
		return;
	}
	var ctx = canvas.getContext('2d');
	if ( ctx ) {
		game.canvas = canvas;
		game.ctx = ctx;
	}

	// Web Audio API が使える場合はそちらを使う
	var AudioContext = checkObject('AudioContext');
	if ( AudioContext ) {
		game.audioCtx = new AudioContext();
	}

	// 音楽再生用のAudioElementの作成
	game.music = document.createElement('audio');
	game.music.addEventListener('canplaythrough',function(){
		game.canplaymusic = true;
	});

	// ゲーム共通の画像の読み込み
	game.imageLogo = game.loadImage('images/logo.jpg');
	game.imageTitle = game.loadImage('images/title.jpg');
	game.imageChikara = game.loadImage('images/chikara.png');
	game.imagePlayer = game.loadImage('images/chara1.png');

	game.imageBuf = document.createElement('canvas');
	game.imageBuf.width = 640;
	game.imageBuf.height = 480;

	// ゲーム共通のサウンドの読み込み
	for ( var i = 0; i < 11; ++i ) {
		game.sounds[i] = game.loadSound('sounds/sound' + (i + 1) + '.ogg');
	}
	for ( var i = 0; i < 6; ++i ) {
		game.playerVoice[i] = game.loadSound('sounds/voice' + (i + 1) + '.ogg');
	}

	// 初期ゲームモードの設定
	game.curGameMode = 'load';

	// AnimationFrame の設定
	var requestAnimationFrame = window.requestAnimationFrame ||
		checkObject('RequestAnimationFrame');
	if ( requestAnimationFrame ) {
		var lastTime = +new Date;
		requestAnimationFrame( function( time ) {
			var elapsedTime = ( time - lastTime ) / 1000.0;
			lastTime = time;
			game.update( elapsedTime );
			requestAnimationFrame( arguments.callee, canvas );
		}, canvas );
	}
}
window.addEventListener('load',function(){
	game.init();
});

game.update = function( elapsedTime ) {
	// 画面の消去
	var canvas = game.canvas;
	var ctx = game.ctx;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// 入力の更新
	game.input.mouse.update();

	// トランジション処理
	if ( game.transition.curMode != game.transition.MODE.NONE ) {
		game.transition.update( elapsedTime );
	}

	// ゲームモード処理
	game.gamemodes[game.curGameMode]( elapsedTime );

	if ( game.transition.curMode != game.transition.MODE.NONE ) {
		game.transition.render();
	}

	// シフトキー＋Ｒキーでゲームのリセット
	// if (CheckHitKey(KEY_INPUT_LSHIFT)) {
	// 	if (CheckHitKey(KEY_INPUT_R)) {
	// 		PlayMusicMem(Music[0], DX_PLAYTYPE_LOOP);
	// 		GameReset();
	// 	}
	// }
};

/**
 * ゲーム共通リソース読み込み待ち
 * @function
 */
game.gamemodes.load = function( elapsedTime ) {
	var res = [
		game.imageLogo, game.imageTitle,
		game.imageChikara, game.imagePlayer
			];
	for ( var i in game.playerVoice ) {
		res.push( game.playerVoice[i] );
	}
	for ( var i in game.sounds ) {
		res.push( game.sounds[i] );
	}
	var complete = true;
	for ( var i in res ) {
		if ( res[i].complete == false ) complete = false;
	}
	if ( complete ) {
		// ゲーム共通リソースの読み込みが完了したらロゴ表示へ
		game.transition.show( game.imageLogo );
		game.sounds[0].play();
		game.phase = 0;
		game.curGameMode = 'logo';
	}
};

/**
 * ロゴ表示
 * @function
 */
game.gamemodes.logo = function( elapsedTime ) {
	switch ( game.phase ) {
		case 0:
			if ( game.transition.isFinished() ) {
				game.wait = 1.5;
				++game.phase;
			}
			break;
		case 1:
			if ( game.wait <= 0.0 ) {
				++game.phase;
				game.transition.hide( game.imageLogo );
			}
			game.ctx.drawImage( game.imageLogo, 0, 0 );
			game.wait -= elapsedTime;
			break;
		case 2:
			if ( game.transition.isFinished() ) {
				game.loadMusic('sounds/music1.ogg');
				++game.phase;
			}
			break;
		case 3:
			if ( game.isCanPlayMusic() ) {
				game.transition.show( game.imageTitle );
				++game.phase;
			}
			break;
		case 4:
			if ( game.transition.isFinished() ) {
				game.playMusic( true );
				game.phase = 0;
				game.curGameMode = 'title';
			}
			break;
	};
};

/**
 * タイトル画面
 * @function
 */
game.gamemodes.title = function( elapsedTime ) {
	var ctx = game.ctx;

	switch ( game.phase ) {
		case 0:
			ctx.drawImage( game.imageTitle, 0, 0 );

			ctx.font = '32px monospace';
			ctx.fillStyle = 'black';
			ctx.textBaseline = 'top';
			ctx.fillText('クリックしたらゲーム開始', 128, 320);

			// デバッグ用
			// タイトル画面でステージ選択ができる
			// シフトキー＋数字キーで選択
			/*if (CheckHitKey(KEY_INPUT_LSHIFT)) {
			  if (CheckHitKey(KEY_INPUT_1) && Stage != 0) {
			  PlaySoundMem(Sound[8], DX_PLAYTYPE_BACK);
			  Stage = 0;
			  }
			  else if (CheckHitKey(KEY_INPUT_2) && Stage != 1) {
			  PlaySoundMem(Sound[8], DX_PLAYTYPE_BACK);
			  Stage = 1;
			  }
			  else if (CheckHitKey(KEY_INPUT_3) && Stage != 2) {
			  PlaySoundMem(Sound[8], DX_PLAYTYPE_BACK);
			  Stage = 2;
			  }
			  else if (CheckHitKey(KEY_INPUT_4) && Stage != 3) {
			  PlaySoundMem(Sound[8], DX_PLAYTYPE_BACK);
			  Stage = 3;
			  }
			  else if (CheckHitKey(KEY_INPUT_5) && Stage != 4) {
			  PlaySoundMem(Sound[8], DX_PLAYTYPE_BACK);
			  Stage = 4;
			  }
			  else if (CheckHitKey(KEY_INPUT_6) && Stage != 5) {
			  PlaySoundMem(Sound[8], DX_PLAYTYPE_BACK);
			  Stage = 5;
			  }
			  else if (CheckHitKey(KEY_INPUT_U) && Up_fl == false) {
			  PlaySoundMem(Sound[8], DX_PLAYTYPE_BACK);
			  MyMaxHP += 1000;
			  Up_fl = true;
			  }
			  else if (!CheckHitKey(KEY_INPUT_U)) {
			  Up_fl = false;
			  }
			  }*/

			if ( game.input.mouse.first ) {
				game.stopMusic();
				game.sounds[9].play();
				game.transition.hide( game.imageTitle );
				++game.phase;
			}
			break;
		case 1:
			if ( game.transition.isFinished() ) {
				game.phase = 0;
				game.curGameMode = 'pregame';
			}
			break;
	}
}

/**
 * ステージリソース読み待ち
 * @function
 */
game.gamemodes.pregame = function( elapsedTime ) {
	switch ( game.phase ) {
		case 0:
			// ステージごとのリソースを読み込む
			game.loadStageResources( game.stage );
			++game.phase;
			break;
		case 1:
			if ( game.isStageResourcesLoadComplete() ) {
				game.phase = 0;
				game.curGameMode = 'telop';
			}
			break;
	}
};

/**
 * メインゲーム開始前テロップ
 * @function
 */
game.gamemodes.telop = function( elapsedTime ) {
	switch ( game.phase ) {
		case 0:
			{
				var telop = ['第１回戦','第２回戦','第３回戦','第４回戦','最終回戦','裏ステージ'];
				game.telop.show(telop[game.stage]);
				game.sounds[1].play();
			}
			++game.phase;
			break;
		case 1:
			if ( game.telop.isFinished() ) {
				game.telop.show('まさる　ＶＳ　' + game.eneName[game.stage]);
				game.sounds[1].play();
				++game.phase;
			}
			break;
		case 2:
			if ( game.telop.isFinished() ) {
				switch (game.stage) {
					case 0: case 1:
						game.loadMusic('sounds/music2.ogg', true);
						break;
					case 2: case 3:
						game.loadMusic('sounds/music3.ogg', true);
						break;
					case 4:
						game.loadMusic('sounds/music4.ogg', true);
						break;
					case 5:
						game.loadMusic('sounds/music8.ogg', true);
						break;
				}
				++game.phase;
			}
			break;
		case 3:
			if ( game.isCanPlayMusic() ) {
				game.transition.show( game.imageBack );
				++game.phase;
			}
			break;
		case 4:
			if ( game.transition.isFinished() ) {
				game.phase = 0;
				game.curGameMode = 'game';
			}
			break;
	}
	// テロップの更新
	game.telop.update( elapsedTime );
	// テロップの描画
	game.telop.render();
};

/**
 * メインゲーム
 * @function
 */
game.gamemodes.game = function( elapsedTime ) {
	switch ( game.phase ) {
		case 0:
			game.playMusic( true );
			game.wait = 0.4;
			game.enableRenderGame = true;
			++game.phase;
			break;
		case 1:
			if (game.wait <= 0.0) {
				game.playerVoice[0].play();
				game.wait = 0.4;
				++game.phase;
			}
			game.wait -= elapsedTime;
			break;
		case 2:
			if (game.wait <= 0.0) {
				game.player.HP = game.player.maxHP;
				game.setInfo( 'まさお', '+' + game.player.maxHP );
				// TODO: 文字を黄色に
				game.sounds[2].play();
				game.wait = 0.4;
				++game.phase;
			}
			if ( game.playerVoice[0].isPlaying() == false ) {
				game.wait -= elapsedTime;
			}
			break;
		case 3:
			if (game.wait <= 0.0) {
				game.enemyVoice[0].play();
				game.wait = 0.4;
				++game.phase;
			}
			if ( game.sounds[2].isPlaying() == false ) {
				game.wait -= elapsedTime;
			}
			break;
		case 4:
			if (game.wait <= 0.0) {
				switch (game.stage) {
					case 0:	game.enemy.maxHP = 600; break;
					case 1:	game.enemy.maxHP = 800; break;
					case 2:	game.enemy.maxHP = 1000; break;
					case 3:	game.enemy.maxHP = 1500; break;
					case 4:	game.enemy.maxHP = 2000; break;
					case 5:	game.enemy.maxHP = 2500; break;
				}
				game.enemy.HP = game.enemy.maxHP;
				game.setInfo( game.eneName[game.stage], '+' + game.enemy.HP );
				// TODO: 文字を黄色に
				game.sounds[2].play();
				game.wait = 0.4;
				++game.phase;
			}
			if ( game.enemyVoice[0].isPlaying() == false ) {
				game.wait -= elapsedTime;
			}
			break;
		case 5:
			if ( game.wait <= 0.0 ) {
				game.setInfo( 'まさるの攻撃！' );
				game.wait = 1.0;
				++game.phase;
			}
			game.wait -= elapsedTime;
			break;
		case 6:
			if ( game.wait <= 0.0 ) {
				game.sounds[6].play();
				game.setInfo( 'レディー！' );
				++game.phase;
				game.wait = 1.0;
			}
			game.wait -= elapsedTime;
			break;
		case 7:
			if ( game.wait <= 0.0 ) {
				game.sounds[7].play();
				game.setInfo( 'ゴ～！' );
				game.wait = 0.5;
				++game.phase;
			}
			game.wait -= elapsedTime;
			break;
		case 8:
			if ( game.wait <= 0.0 ) {
				game.player.bai = 1;
				game.input.clickReset();
				game.wait = 3.0;
				++game.phase;
			}
			if ( game.sounds[7].isPlaying() == false ) {
				game.wait -= elapsedTime;
			}
			break;
		case 9:
			game.input.onclick = function() {
				game.sounds[3].play();
				game.player.showAtt = true;
				if ( Math.floor(Math.random() * 10) == 0 && !game.player.chikara[2] ) {
					++game.player.bai;
				} else if ( Math.floor(Math.random() * 6) == 0 && game.player.chikara[2] ) {
					++game.player.bai;
				}
			};
			game.player.enableAtt = true;
			++game.phase;
			// fall through
		case 10:
			if ( game.wait <= 0.0 ) {
				game.input.onclick = null;
				game.player.enableAtt = false;
				if ( game.input.clickCount > 30) {
					game.player.power += game.input.clickCount - 30;
					if ( game.player.power > 50) game.player.power = 50;
					if ( game.player.power == 50) {
						game.player.chikara[3] = true;
						game.player.chikara[2] = true;
						game.player.chikara[1] = true;
						game.player.chikara[0] = true;
					} else if ( game.player.power >= 40) {
						game.player.chikara[2] = true;
						game.player.chikara[1] = true;
						game.player.chikara[0] = true;
					} else if ( game.player.power >= 30 ) {
						game.player.chikara[1] = true;
						game.player.chikara[0] = true;
					} else if ( game.player.power >= 20 ) {
						game.player.chikara[0] = true;
					}
					game.player.maxHP += ( game.input.clickCount - 30) * 10;
					game.player.HP += ( game.input.clickCount - 30) * 10;
				}
				if ( game.player.chikara[0] && !game.player.chikara[3] ) {
					game.poKou = Math.floor( game.input.clickCount * game.player.bai * (1.0 / 3.0));
				} else if ( game.player.chikara[3] ) {
					game.poKou = Math.floor( game.input.clickCount * game.player.bai * (2.0 / 3.0));
				} else {
					game.poKou = 0;
				}
				game.wait = 0;
				++game.phase;
				break;
			}
			game.info[0] = '' + game.input.clickCount + ' × ' + game.player.bai;
			if ( game.player.chikara[0] && !game.player.chikara[3] ) {
				game.info[1] = '' + ( game.input.clickCount * game.player.bai ) +
					' ＋ ' + ( Math.floor( game.input.clickCount * game.player.bai * (1.0 / 3.0) ) );
			} else if ( game.player.chikara[3] ) {
				game.info[1] = '' + ( game.input.clickCount * game.player.bai ) +
					' ＋ ' + ( Math.floor( game.input.clickCount * game.player.bai * (2.0 / 3.0) ) );
			} else {
				game.info[1] = '' + ( game.input.clickCount * game.player.bai );
			}
			game.info[2] = 'あと' + Math.floor(game.wait) + '秒';
			game.wait -= elapsedTime;
			// debug
			//game.input.onclick();
			//game.input.clickCount++;
			break;
		case 11:
			switch ( game.wait ) {
				case 0:
					if ( game.player.chikara[3] && !game.player.zenkai ) {
						game.player.zenkai = true;
						game.player.HP = game.player.maxHP;
						game.setInfo( 'まさお', '+' + game.player.maxHP );
						game.sounds[2].play();
						++game.wait;
						break;
					}
					game.wait += 2;
					break;
				case 1:
					if ( game.sounds[2].isPlaying() == false ) {
						++game.wait;
					}
					break;
				case 2:
					if ( ( game.input.clickCount * game.player.bai ) < 50 ) {
						game.playerVoice[1].play();
					} else if (( game.input.clickCount * game.player.bai) > 50 && ( game.input.clickCount * game.player.bai) < 150) {
						game.playerVoice[2].play();
					} else {
						game.playerVoice[3].play();
					}
					game.setInfo(
							game.eneName[game.stage] + 'に' + ( game.input.clickCount * game.player.bai + game.poKou ),
							'のダメージ！' );
					game.wait = 0.66;
					++game.phase;
					break;
			}
			break;
		case 12:
			if ( game.wait <= 0.0 ) {
				game.enemy.HP -= game.input.clickCount * game.player.bai + game.poKou;
				if ( game.enemy.HP < 0 ) game.enemy.HP = 0;
				game.sounds[10].play();
				game.setInfo(
						game.eneName[game.stage],
						'' + ( ( game.input.clickCount * game.player.bai + game.poKou ) * -1 ) );
				game.wait = 1.0;
				++game.phase;
			}
			game.wait -= elapsedTime;
			break;
		case 13:
			if ( game.wait <= 0.0 ) {
				game.wait = 0;
				if ( game.enemy.HP <= 0 ) {
					game.phase += 1;
					game.wait = 0;
					break;
				} else {
					game.phase += 2;
					game.wait = 1.0;
					break;
				}
			}
			game.wait -= elapsedTime;
			break;
		case 14: // 敵を倒した
			switch ( game.wait ) {
				case 0:
					game.stopMusic();
					game.loadMusic('sounds/music6.ogg');
					game.enemyVoice[5].play();
					++game.wait;
					break;
				case 1:
					if ( game.enemyVoice[5].isPlaying() == false ) {
						game.playerVoice[4].play();
						++game.wait;
					}
					break;
				case 2:
					if ( game.playerVoice[4].isPlaying() == false &&
						 game.isCanPlayMusic() ) {
						game.playMusic();
						game.setInfo( '倒しました！' );
						++game.wait;
					}
					break;
				case 3:
					if ( game.music.currentTime >= game.music.duration ) {
						var bufctx = game.imageBuf.getContext('2d');
						if ( bufctx ) {
							bufctx.clearRect( 0, 0, 640, 480 );
							game.drawGameScreen();
							bufctx.drawImage( game.canvas, 0, 0 );
							game.ctx.clearRect( 0, 0, 640, 480 );
						}
						game.transition.hide( game.imageBuf );
						game.enableRenderGame = false;
						++game.wait;
					}
					break;
				case 4:
					if ( game.transition.isFinished() ) {
						++game.stage;
						if ( ( game.stage == 5 && game.player.power != 50) || game.stage == 6 ) {
							// TODO: エンディングテキストの設定
							game.loadMusic('sounds/music7.ogg');
							game.phase = 0;
							game.curGameMode = 'end';
							game.roll = 522.0;
							break;
						}
						game.phase = 0;
						game.wait = 0;
						game.player.bai = 1;
						game.player.HP = 0;
						game.enemy.maxHP = 0;
						game.enemy.HP = 0;
						game.player.power = 0;
						for ( var i in game.player.chikara ) {
							game.player.chikara[i] = false;
						}
						game.player.zenkai = false;
						game.curGameMode = 'pregame';
					}
					break;
			}
			break;
		case 15:
			game.setInfo( game.eneName[game.stage] + 'の攻撃！' );
			if ( game.wait <= 0.0 ) {
				game.wait = 3;
				game.enemy.clickCount = 0;
				game.enemy.bai = 1;
				switch ( game.stage ) {
					case 0: game.enemy.baiR = 10; break;
					case 1: game.enemy.baiR = 9; break;
					case 2: game.enemy.baiR = 8; break;
					case 3: game.enemy.baiR = 7; break;
					case 4: game.enemy.baiR = 6; break;
					case 5: game.enemy.baiR = 3; break;
				}
				++game.phase;
			}
			game.wait -= elapsedTime;
			break;
		case 16:
			if ( Math.floor( Math.random() * game.enemy.baiR ) == 0 ) {
				++game.enemy.clickCount;
				game.sounds[4].play();
				if ( Math.floor( Math.random() * 5 ) == 0 ) {
					game.enemy.bai++;
				}
				game.enemy.showAtt = true;
			}
			if ( game.wait <= 0.0 ) {
				if ( game.player.chikara[0] && !game.player.chikara[3] )
					game.poKou = Math.floor( game.enemy.clickCount * game.enemy.bai * (1.0 / 4.0) );
				else if ( game.player.chikara[3] )
					game.poKou = Math.floor( game.enemy.clickCount * game.enemy.bai * (3.0 / 4.0) );
				else
					game.poKou = 0;
				++game.phase;
			}
			game.info[0] = '' + game.enemy.clickCount + ' × ' + game.enemy.bai +
				' ＝ ' + ( game.enemy.clickCount * game.enemy.bai );
			if ( game.player.chikara[0] && !game.player.chikara[3] ) {
				game.info[1] = '' + ( game.enemy.clickCount * game.enemy.bai ) + ' － ' +
					Math.floor( game.enemy.clickCount * game.enemy.bai * ( 1.0 / 4.0 ) );
			} else if ( game.player.chikara[3] ) {
				game.info[1] = '' + ( game.enemy.clickCount * game.enemy.bai ) + ' － ' +
					Math.floor( game.enemy.clickCount * game.enemy.bai * ( 3.0 / 4.0 ) );
			} else {
				game.info[1] = '' + ( game.enemy.clickCount * game.enemy.bai );
			}
			game.info[2] = 'あと' + Math.floor(game.wait) + '秒';
			game.wait -= elapsedTime;
			break;
		case 17:
			if ( ( game.enemy.clickCount * game.enemy.bai ) < 60 ) {
				game.enemyVoice[1].play();
			} else if ( ( game.enemy.clickCount * game.enemy.bai ) > 60 && ( game.enemy.clickCount * game.enemy.bai) < 180 ) {
				game.enemyVoice[2].play();
			} else {
				game.enemyVoice[3].play();
			}
			game.setInfo(
				'まさるは' + ( game.enemy.clickCount * game.enemy.bai - game.poKou ),
				'くらった！' );
			game.wait = 0.66;
			++game.phase;
			break;
		case 18:
			if ( game.wait <= 0.0 ) {
				game.wait = 1.0;
				game.sounds[5].play();
				game.player.HP -= ( game.enemy.clickCount * game.enemy.bai - game.poKou );
				if ( game.player.HP < 0.0 ) game.player.HP = 0;
				game.setInfo( 'まさる',
					'' + ( ( game.enemy.clickCount * game.enemy.bai - game.poKou ) * -1 ) );
				++game.phase;
			}
			game.wait -= elapsedTime;
			break;
		case 19:
			if ( game.wait <= 0.0 ) {
				if ( game.player.HP <= 0.0 ) {
					game.phase += 1;
				} else {
					game.phase += 2;
				}
				game.wait = 0;
				break;
			}
			game.wait -= elapsedTime;
			break;
		case 20:
			switch ( game.wait ) {
				case 0:
					game.stopMusic();
					game.loadMusic('sounds/music5.ogg');
					game.enemyVoice[4].play();
					++game.wait;
					break;
				case 1:
					if ( game.enemyVoice[4].isPlaying() == false ) {
						game.playerVoice[5].play();
						++game.wait;
					}
					break;
				case 2:
					if ( game.playerVoice[5].isPlaying() == false &&
						 game.isCanPlayMusic() ) {
						game.playMusic();
						game.setInfo( 'やられました。' );
						++game.wait;
					}
					break;
				case 3:
					if ( game.music.currentTime >= game.music.duration ) {
						var bufctx = game.imageBuf.getContext('2d');
						if ( bufctx ) {
							bufctx.clearRect( 0, 0, 640, 480 );
							game.drawGameScreen();
							bufctx.drawImage( game.canvas, 0, 0 );
							game.ctx.clearRect( 0, 0, 640, 480 );
						}
						game.transition.hide( game.imageBuf );
						game.enableRenderGame = false;
						++game.wait;
					}
					break;
				case 4:
					if ( game.transition.isFinished() ) {
						game.reset();
						game.transition.show( game.imageLogo );
						game.sounds[0].play();
						game.phase = 0;
						game.curGameMode = 'logo';
					}
					break;
			}
			break;
		case 21:
			game.player.clickCount = 0;
			game.player.bai = 1;
			game.wait = 1.0;
			game.setInfo( 'まさるの攻撃！' );
			game.phase = 6;
			break;
	}
	// ゲーム画面の描画
	if ( game.enableRenderGame ) {
		game.drawGameScreen();
	}
};

/**
 * エンディング
 * @function
 */
game.gamemodes.end = function( elapsedTime ) {
	var i, j;
	var ctx = game.ctx;

	switch ( game.phase ) {
		case 0:
			if ( game.isCanPlayMusic() ) {
				game.playMusic();
				++game.phase;
			}
			break;
		case 1:
			if (Math.floor(game.roll) > 0) {
				j = 0;
			} else {
				j = Math.floor( Math.floor(-game.roll) / 42 );
			}
			for ( i = 0; i < 13; i++ ) {
				if ( i + j <= 77 && Math.floor(game.roll) + 42 * (i + j) <= 480 ) {
					ctx.font = '32px monospace';
					ctx.fillStyle = 'white';
					ctx.textAlign = 'center';
					ctx.fillText( game.endingText[i+j], 320, Math.floor(game.roll) + 42 * (i + j) );
					ctx.textAlign = 'left';
				}
				if ( Math.floor(game.roll) + 42 * 77 < -32 ) {
					game.stopMusic();
					game.reset();
					game.transition.show( game.imageLogo );
					game.sounds[0].play();
					game.phase = 0;
					game.curGameMode = 'logo';
					break;
				}
			}
			game.roll -= 30 * elapsedTime;
			break;
	}
};

/**
 * ゲーム画面の描画
 * @function
 */
game.drawGameScreen = function() {
	var ctx = game.ctx;

	ctx.drawImage( game.imageBack, 0, 0 );

	ctx.font = '22px monospace';
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';

	ctx.fillStyle = 'white';
	ctx.fillText('まさる', 5, 5);
	ctx.fillText(game.eneName[game.stage], 5, 40);

	ctx.fillStyle = 'red';
	ctx.strokeStyle = 'white';
	ctx.fillRect(88, 5, 392, 21);
	ctx.fillRect(88, 40, 392, 21);
	ctx.strokeRect(88, 5, 392, 21);
	ctx.strokeRect(88, 40, 392, 21);

	ctx.fillStyle = 'yellow';
	if ( game.player.HP > 0 ) {
		ctx.fillRect(88, 5, Math.floor(392 * ( game.player.HP / game.player.maxHP )), 21 );
	}
	if ( game.enemy.HP > 0 ) {
		ctx.fillRect(88, 40, Math.floor(392 * ( game.enemy.HP / game.enemy.maxHP )), 21 );
	}

	ctx.fillStyle = 'white';
	ctx.fillText('' + game.player.HP + '/' + game.player.maxHP, 485, 5);
	ctx.fillText('' + game.enemy.HP + '/' + game.enemy.maxHP, 485, 40);

	// プレイヤーキャラクターの描画
	if ( 1 < game.phase && game.phase < 5 ) {
		ctx.drawImage( game.imagePlayer, 0, 0, 200, 390, 16, 64, 200, 390 );
	}
	var srcPos = { x: 400, y: 0 };
	if ( 5 <= game.phase ) {
		for ( var i = 2; i >= 0; --i ) {
			if ( game.player.HP >= game.player.maxHP * ( i / 3.0 ) ) {
				srcPos.x = [0, 200, 400][i];
			}
		}
		if ( game.player.HP <= 0 ) {
			srcPos.x = 400; srcPos.y = 390;
		}
		if ( game.phase == 10 ) {
			if ( game.player.showAtt ) {
				game.player.showAtt = false;
				srcPos.x = 200; srcPos.y = 390;
			}
			else {
				srcPos.x = 0; srcPos.y = 390;
			}
		}
		ctx.drawImage( game.imagePlayer, srcPos.x, srcPos.y, 200, 390, 16, 64, 200, 390 );
	}

	// 敵キャラの描画
	if ( 3 < game.phase && game.phase < 5) {
		srcPos.x = 0; srcPos.y = 0;
		ctx.drawImage( game.imageEnemy, srcPos.x, srcPos.y, 200, 390, 419, 64, 200, 390 );
	}
	srcPos.x = 400; srcPos.y = 0;
	if ( game.phase >= 5 ) {
		for ( var i = 2; i >= 0; --i ) {
			if ( game.enemy.HP >= game.enemy.maxHP * ( i / 3.0 ) ) {
				srcPos.x = [0, 200, 400][i];
			}
		}
		if ( game.enemy.HP <= 0 ) {
			srcPos.x = 400; srcPos.y = 390;
		}
		if ( game.phase == 16 ) {
			if ( game.enemy.showAtt ) {
				game.enemy.showAtt = false;
				srcPos.x = 200; srcPos.y = 390;
			} else {
				srcPos.x = 0; srcPos.y = 390;
			}
		}
		ctx.drawImage( game.imageEnemy, srcPos.x, srcPos.y, 200, 390, 419, 64, 200, 390 );
	}

	// メッセージ
	ctx.fillStyle = 'white';
	if ( game.info[0] ) ctx.fillText( game.info[0], 222, 85 );
	if ( game.info[1] ) ctx.fillText( game.info[1], 222, 110 );
	if ( game.info[2] ) ctx.fillText( game.info[2], 222, 135 );

	ctx.fillStyle = 'white';
	ctx.fillText('聖なる力', 222, 247);
	ctx.fillStyle = 'rgb(120,35,20)';
	ctx.fillRect( 222, 277, 318-222, 304-277 );
	ctx.strokeStyle = 'white';
	ctx.strokeRect( 222, 277, 318-222, 304-277 );
	if ( game.player.power > 0 ) {
		ctx.fillStyle = 'rgb(220,65,50)';
		ctx.fillRect( 223, 278, Math.floor( game.player.power / 50.0 * 94), 303-278 );
	}
	ctx.fillStyle = 'white';
	ctx.fillText('' + game.player.power, 321, 277);

	if ( game.player.chikara[0] )
		ctx.drawImage( game.imageChikara, 0, 0, 64, 60, 222, 309, 64, 60 );
	if ( game.player.chikara[1]  )
		ctx.drawImage( game.imageChikara, 63, 0, 63, 60, 294, 309, 63, 60 );
	if ( game.player.chikara[2] )
		ctx.drawImage( game.imageChikara, 126, 0, 63, 60, 222, 381, 63, 60 );
	if ( game.player.chikara[3] )
		ctx.drawImage( game.imageChikara, 189, 0, 61, 60, 294, 381, 61, 60 );
}
game.setInfo = function( info1, info2, info3 ) {
	game.info[0] = info1;
	game.info[1] = info2;
	game.info[2] = info3;
};

/**
 * ゲームのリセット
 * @function
 */
game.reset = function () {
	game.curGameMode = 'title';
	game.stage = 0;
	game.phase = 0;
	game.wait = 0;

	game.player.HP = 0;
	game.player.maxHP = 1000;
	game.player.power = 0;

	game.enemy.HP = 0;
	game.enemy.maxHP = 0;

	for ( var i in game.chikara ) {
		game.chikara[i] = false;
	}
	game.zenkai = false;
}
