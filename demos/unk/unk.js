/**
 * UNK
 * @author zukkun
 */

/**
 * コアシステム
 */
var Core = {};

/**
 * CanvasElement
 */
Core.canvas = null;

/**
 * CanvasRenderingContext2D
 */
Core.ctx = null;

/**
 * 画面情報
 */
Core.screenSize = {}; // 論理サイズ
Core.screenSize.width = 240;
Core.screenSize.height = 180;
Core.displaySize = {}; // 実表示サイズ
Core.displaySize.width = 480;
Core.displaySize.height = 360;
Core.clearColor = 'gray'; // 画面クリア色

/**
 * エラー処理
 */
Core.errorDisp = document.createElement('div');
Core.error = function(e) {
    Core.errorDisp.innerHTML += ('エラー：' + e.message + '<br/>');
    throw e;
};

/**
 * シーン
 * 設定可能なイベント
 * enter: シーン開始, update: 更新処理, render: 描画処理, exit: シーン終了
 */
Core.Scene = function(){
    this._events = {};
};
/**
 * シーンイベントの追加
 */
Core.Scene.prototype.addEventListener = function(event, callback) {
    if (typeof event !== 'string') {
        throw new TypeError('イベント名が文字列で設定されていない');
    }
    if (typeof callback !== 'function') {
        throw new TypeError('コールバック関数がFunctionではない');
    }
    if (!this._events[event]) {
        this._events[event] = [];
    }
    this._events[event].push(callback);
};
/**
 * シーンイベントの削除
 */
Core.Scene.prototype.removeEventListener = function(event, callback) {
    if (typeof event !== 'string') {
        throw new TypeError('イベント名が文字列で設定されていない');
    }
    if (typeof callback !== 'function') {
        throw new TypeError('コールバック関数がFunctionではない');
    }
    if (this._events[event]) {
        for (var i = 0, l = this._events.length; i < l; ++i) {
            if (this._events[event][i] === callback) {
                this._events[event] = this._events[event].splice(i, 1);
            }
        }
    }
};
/**
 * シーンイベントの発行
 */
Core.Scene.prototype.dispatchEvent = function(event, args) {
    if (this._events[event]) {
        for (var i = 0, l = this._events[event].length; i < l; ++i) {
            this._events[event][i].apply(this, args);
        }
    }
};

/**
 * 現在シーン
 */
Object.defineProperty(Core, 'scene', {
    get: function() { return Core._scene; },
    set: function(scene) {
        if ((scene instanceof Core.Scene) === false) {
            throw new TypeError('登録しようとしたシーンがSceneではない');
        }

        // すでにシーンが設定されていたら、シーン終了のイベント発行
        if (Core._scene) {
            Core._scene.dispatchEvent('exit');
        }

        Core._scene = scene;
        
        // シーン開始のイベントを発行
        scene.dispatchEvent('enter');
    }
});

/**
 * 初期化処理
 */
Core.initialize = function() {
    try {
        // Canvasのセットアップ
        var canvas = document.createElement('canvas');
        canvas.width = Core.screenSize.width;
        canvas.height = Core.screenSize.height;
        canvas.style.width = Core.displaySize.width.toString() + 'px';
        canvas.style.height = Core.displaySize.height.toString() + 'px';
        canvas.style.backgroundColor = Core.clearColor;
        Core.canvas = canvas;

        Core.ctx = canvas.getContext('2d');

        // 更新処理の設定
        var requestAnimationFrame = requestAnimationFrame ||
            webkitRequestAnimationFrame ||
            mozRequestAnimationFrame ||
            oRequestAnimationFrame ||
            msRequestAnimationFrame;
        if (!requestAnimationFrame) {
            throw new Error('requestAnimationFrameが使用できないWebブラウザです。');
        }
        var lastTime = null;
        var elapsedTime = 0;
        var frameCallback = function(time) {
            if (lastTime) {
                elapsedTime = (time - lastTime) / 1000.0;
            } else {
                elapsedTime = 0;
            }
            lastTime = time;

            // 更新処理
            Core.update(elapsedTime);
            // 描画処理
            Core.render();

            requestAnimationFrame(frameCallback);
        };
        requestAnimationFrame(frameCallback);
    } catch(e) {
        Core.error(e);
    }
};

/**
 * 更新処理
 * @param {Number} elapsedTime フレーム経過時間(秒)
 */
Core.update = function(elapsedTime) {
    // シーン更新のイベント発行
    if (Core.scene) {
        Core.scene.dispatchEvent('update', [elapsedTime]);
    }
};

/**
 * 描画処理
 */
Core.render = function() {
    // 画面クリア
    Core.ctx.clearRect(0, 0, Core.canvas.width, Core.canvas.height);

    // シーンの描画
    if (Core.scene) {
        Core.scene.dispatchEvent('render');
    }
};

/**
 * SVGテキストからImageを生成
 */
Core.createImageFromSVG = function(svg, callback) {
    var img = new Image();
    img.onload = callback;
    img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    return img;
};

/**
 * ゲーム本体
 */
var Game = {};

/**
 * シーンデータ
 */
Game.scenes = {}; // シーンデータ

/**
 * タイトルシーン
 */
Game.scenes.title = new Core.Scene();

/**
 * タイトル画面デザイン
 */
Game.scenes.title.titleImageSVG =
"<?xml version='1.0' encoding='UTF-8' standalone='yes'?>" +
"<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='240px' height='180px'>" +
"    <text x='50' y='50' font-size='30' fill='black'>UNK</text>" +
"</svg>";

/**
 * タイトルシーン開始
 */
Game.scenes.title.addEventListener('enter', function() {
    this.titleImage = Core.createImageFromSVG(this.titleImageSVG, function(){
        this.loaded = true;
    }.bind(this));
});

/**
 * タイトルシーン更新
 */
Game.scenes.title.addEventListener('update', function() {
});

/**
 * タイトルシーン描画
 */
Game.scenes.title.addEventListener('render', function() {
    if (this.loaded) {
        Core.ctx.drawImage(this.titleImage, 0, 0);
    }
});

/**
 * タイトルシーン終了
 */
Game.scenes.title.addEventListener('exit', function() {
});
