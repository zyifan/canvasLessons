// 获取当前时间
var getTimeNow = function () {
    return +new Date();
 };
 
 // Game 游戏引擎....................................................................... 
 var Game = function (gameName, canvasId) {
    var canvas = document.getElementById(canvasId),
        self = this; // Used by key event handlers below
 
    // 基础设置
    this.context = canvas.getContext('2d');
    this.gameName = gameName;
    this.sprites = [];//精灵
    this.keyListeners = [];//键盘事件
 
    // 高分榜后缀
    this.HIGH_SCORES_SUFFIX = '_highscores';
 
    // 加载图片   
    this.imageLoadingProgressCallback;
    this.images = {};
    this.imageUrls = [];
    this.imagesLoaded = 0;
    this.imagesFailedToLoad = 0;
    this.imagesIndex = 0;
 
    // Time    
    this.startTime = 0;
    this.lastTime = 0;
    this.gameTime = 0;
    this.fps = 0;
    this.STARTING_FPS = 60;
 
    this.paused = false;
    this.startedPauseAt = 0;
    this.PAUSE_TIMEOUT = 100;
 
    // Sound 
    this.soundOn = true;
    this.soundChannels = [];//音轨
    this.audio = new Audio();
    this.NUM_SOUND_CHANNELS = 10;//音轨数量
    // 根据音轨数量创建音频el元素
    for (var i=0; i < this.NUM_SOUND_CHANNELS; ++i) {
       var audio = new Audio();
       this.soundChannels.push(audio);
    }
 
    // 此处事件处理方法里面的this指向 window，所以用 self 代替 this 
    // 监听 window 键盘按下事件
    window.onkeypress = function (e) { self.keyPressed(e)  };
    window.onkeydown  = function (e) { self.keyPressed(e); };
 
    return this;
 };
 
 // Game methods............................................................... 
 Game.prototype = {
    //根据图片URL, 返回一个图像对象el    
    // 返回图像对象。只有在loadImages返回100之后，才可以调用该方法
    getImage: function (imageUrl) {
       return this.images[imageUrl];
    },
    
    // 当有一个图片加载成功之后，就将 imagesLoaded 加 1 
    imageLoadedCallback: function (e) {
       this.imagesLoaded++;
    },
    
    // 当有一个图片加载失败时，就将 imagesFailedToLoad 加1  
    imageLoadErrorCallback: function (e) {
       this.imagesFailedToLoad++;
    },
 
    // 加载图片
    loadImage: function (imageUrl) {
       var image = new Image(),
           self = this; // self 指向 game
 
       image.src = imageUrl;
 
       image.addEventListener('load',
          function (e) {
             self.imageLoadedCallback(e); 
          });
 
       image.addEventListener('error',
          function (e) {
             self.imageLoadErrorCallback(e);
          });
 
       // 存储image对象   
       this.images[imageUrl] = image;
    },
 
    // 你可以重复调用此方法，去加载数组imageUrls中的图片（调用queueImage方法存储图片数组）
    // 该方法返回图片加载进度百分比 
    // 当返回数时100时，说明所有图片都被加载完毕，此时就可以停止调用此方法    
    // 开发者需要持续调用该方法，直到返回100为止（方法的返回值表示图像 加载完成百分比）
    loadImages: function () {
 
       // If there are images left to load  加载所有图片
       if (this.imagesIndex < this.imageUrls.length) {
          // 加载图片   
          this.loadImage(this.imageUrls[this.imagesIndex]);
          this.imagesIndex++;
       }
 
       // Return the percent complete  返回图片完成加载数量的百分比
       return (this.imagesLoaded + this.imagesFailedToLoad) /
               this.imageUrls.length * 100;
    },
 
    // 调用此方法将图像url添加到imageUrls数组中. 将图像放入加载队列中
    // The image will be loaded by loadImages().    
    queueImage: function (imageUrl) {
       this.imageUrls.push(imageUrl);
    },
    
    // Game loop 游戏循环..................................................................
    
    // 实现游戏循环
    // 设置游戏启动时间，并请求浏览器绘制下一帧动画，以此开始游戏
    start: function () {
       var self = this;               // 记录 game 的 this 对象
       this.startTime = getTimeNow(); // 记录游戏开始时间 (used for pausing)
 
       window.requestNextAnimationFrame(
          function (time) {
             // 这里的 this 指向 window 而不是 game ,使用 self 代替 this             
             self.animate.call(self, time); 
          });
    },
 
    // 驱动游戏的动画. 这个方法在浏览器下一个动画帧的时候被浏览器调用.
    // this.startAnimate(), this.paintUnderSprites(), this.paintOverSprites(), and this.endAnimate() 方法不做任何事. 您可以重写这些方法来创建动画框架
    /**
     *  1、如果游戏暂停了，那么跳过以下各步骤，并在100毫秒后再次执行游戏循环
     *  2、更新帧速率
     *  3、设置游戏时间
     *  4、清除屏幕活动
     *  5、在播放动画前，调用名为setAnimate()的回调方法
     *  6、绘制精灵背后内容
     *  7、更新精灵
     *  8、绘制精灵
     *  9、绘制精灵前方内容
     *  10、在动画播放完毕之后，调用名为endAnimate的回调方法
     *  11、请求浏览器播放下一帧动画
    */ 
    animate: function (time) {
       var self = this; // window.requestNextAnimationFrame() called by DOMWindow
       
       // 如果游戏暂停   
       if (this.paused) {
          // 在暂停 PAUSE_TIMEOUT (100) ms 时间 ,再次调用此方法，看看游戏是否暂停. 没有必要经常检查.          
          setTimeout( function () {
             window.requestNextAnimationFrame(
                function (time) {
                   self.animate.call(self, time);
                });
          }, this.PAUSE_TIMEOUT);// 在 PAUSE_TIMEOUT (100) 之后，调用 requestNextAnimationFrame 方法
       } 
       else {                       // 游戏没有暂停
          this.tick(time);          // 在播放每帧动画前更新帧速率fps、游戏时间game time
          this.clearScreen();       // 清除屏幕准备下一帧
 
          // startAnimate负责每帧动画播放前的准备工作，比如碰撞检测
          this.startAnimate(time);  // 1、根据你的需要重写, startAnimate() 游戏引擎在播放每帧动画前都会调用此回调方法。默认情况下它不做任何事情，留待开发者在其中实现游戏逻辑
          // paintUnderSprites 用于绘制背景，有时也用它来绘制游戏场景中的部分内容
          this.paintUnderSprites(); // 2、根据你的需要重写, 游戏引擎在绘制精灵前会调用此回调方法，默认情况下它不做任何事情，留待开发者在其中实现游戏逻辑
 
          this.updateSprites(time); // Invoke sprite behaviors 更新所有精灵对象
          this.paintSprites(time);  // Paint sprites in the canvas 绘制所有精灵对象
        
          // paintOverSprites绘制叠放在精灵前方的内容
          this.paintOverSprites();  //  3、根据你的需要重写, 游戏引擎在绘制精灵后会调用此回调方法，默认情况下它不做任何事情，留待开发者在其中实现游戏逻辑
          this.endAnimate();        //  4、根据你的需要重写, 游戏引擎在绘制完当前帧之后调用此回调方法，默认情况下它不做任何事情，留待开发者在其中实现游戏逻辑
 
          // 存储当前时间  
          this.lastTime = time;
 
          // 当下一个动画帧的时间再次调用此方法时 
          window.requestNextAnimationFrame(function (time) {
            self.animate.call(self, time); // this 指向 window，使用self代替
          });
       }
    },
 
    // 在播放每帧动画前更新帧速率 frame rate/fps、游戏时间 game time、应用程序最后绘制动画帧的时间 last time
    tick: function (time) {
       // 更新帧速率 frame rate，1秒可以绘制的帧数量
       this.updateFrameRate(time);

       // 游戏所用时间 ： 当前时间 - 游戏开始时间    
       this.gameTime = (getTimeNow()) - this.startTime;
    },
 
    // 基于上次动画帧所花费的时间量，更新帧速率 frame rate    
    updateFrameRate: function (time) {
       if (this.lastTime === 0) this.fps = this.STARTING_FPS;
       else                     this.fps = 1000 / (time - this.lastTime); // 1s/一帧时间 = 1秒可以绘制的帧数量
    },
 
    // 清除整个画布    
    clearScreen: function () {
       this.context.clearRect(0, 0,
          this.context.canvas.width, this.context.canvas.height);
    },
 
    //更新所有精灵. The sprite update() method invokes all of a sprite's behaviors. 
    updateSprites: function (time) {
       for(var i=0; i < this.sprites.length; ++i) {
          var sprite = this.sprites[i];

          // this.behaviors[index].execute(sprite, context, time) 挨个执行behavior
          sprite.update(this.context, time);
       };
    },
 
    // 绘制所有精灵.    
    paintSprites: function (time) {
       for(var i=0; i < this.sprites.length; ++i) {
          var sprite = this.sprites[i];
          if (sprite.visible)
             sprite.paint(this.context);
       };
    },
 
    // 暂停并继续游戏, 切换游戏暂停状态. 切换后，如果是非暂停状态，则应用会从开始时间里面减去暂停所消耗的时间.
    // That means the game picks up where it left off, without a potentially large jump in time. 
    togglePaused: function () {
       // 获取当前时间
       var now = getTimeNow();
        
       // 切换暂停状态   
       this.paused = !this.paused;
 
       if (this.paused) { //如果暂停
          // 存储暂停时间
          this.startedPauseAt = now;
       }
       else { // 没有暂停
          // Adjust start time, so game starts where it left off when
          // the user paused it. 
          this.startTime = this.startTime + (now - this.startedPauseAt);//调整开始时间（开始时间 + 暂停时间）
          // 存储当前时间
          this.lastTime = now;
       }
    },
 
    // 给定某个物体的速度，计算为当前帧该对象移动的像素数   
    // 支持基于时间的运动，传入物体1s移动的像素数，返回该物体在当前这帧动画中移动了多少个像素 
    pixelsPerFrame: function (time, velocity) {
       // Sprites 精灵每一帧移动的像素距离 (pixels/frame).
       // Sprite 精灵速度 像素/秒 ( pixels / second ),
       // 像素/秒 * 用时s/帧 = 像素/帧   
       // so: (pixels/second) * (second/frame) = pixels/frame:
 
       return velocity / this.fps;  // pixels / frame
    },
 
    // High scores 高分榜, 将高分榜数组以json格式存放在本地存储空间中................................................................ 
    // 从 local storage 获取分数数组, 方法将游戏名称加上“_highscores”后缀，并以此字符串作为键值，将游戏高分榜存放在本地存储空间.    
    getHighScores: function () {
       var key = this.gameName + this.HIGH_SCORES_SUFFIX,
           highScoresString = localStorage[key];
 
       if (highScoresString == undefined) {
          localStorage[key] = JSON.stringify([]);
       }
       return JSON.parse(localStorage[key]);
    },
 
    // 将分数存储到 localstorage 中. 
    // 将高分榜数据从本地存储空间载入一个列表中，然后将当前最高分置于列表顶部，最后把列表存回本地存储空间
    setHighScore: function (highScore) {
       var key = this.gameName + this.HIGH_SCORES_SUFFIX,
           highScoresString = localStorage[key];

       var highScores = JSON.parse(highScoresString);
       highScores.unshift(highScore);
       localStorage[key] = JSON.stringify(highScores);
    },
 
    // 清除 local storage 中的分数. 
    // 可以将本地存储空间中存放的高分榜数组清空
    clearHighScores: function () {
       localStorage[this.gameName + this.HIGH_SCORES_SUFFIX] = JSON.stringify([]);
    },
 
    // Key listeners 键盘监听函数..............................................................
 
    // 向游戏中注册按键监听器, 添加一个 (key, listener） 对象到 keyListeners 数组.    
    addKeyListener: function (keyAndListener) {
       this.keyListeners.push(keyAndListener);
    },    
    // 根据 key 值, 返回一个相关联的事件处理函数 
    findKeyListener: function (key) {
       var listener = undefined;
       
       for(var i=0; i < this.keyListeners.length; ++i) {
          var keyAndListener = this.keyListeners[i],
              currentKey = keyAndListener.key;
          if (currentKey === key) {
             listener = keyAndListener.listener;
          }
       };
       return listener;
    },
 
    // keydown、keypress事件的处理方法    
    keyPressed: function (e) {
       var listener = undefined,
           key = undefined;
 
       switch (e.keyCode) {
          // Add more keys as needed
 
          case 32: key = 'space';        break;
          case 68: key = 'd';            break;
          case 75: key = 'k';            break;
          case 83: key = 's';            break;
          case 80: key = 'p';            break;
          case 37: key = 'left arrow';   break;
          case 39: key = 'right arrow';  break;
          case 38: key = 'up arrow';     break;
          case 40: key = 'down arrow';   break;
       }
       
       // 获取 key 所对应的事件处理函数    
       listener = this.findKeyListener(key);
       if (listener) { // listener is a function
          listener();  // invoke the listener function
       }
    },
 
    // Sound 音乐......................................................................
 
    // 如何浏览器支持 ogg 文件格式返回 true 
    canPlayOggVorbis: function () {       
        // canPlayType(type) 方法浏览器是否能播放指定的音频/视频类型
       return "" != this.audio.canPlayType('audio/ogg; codecs="vorbis"');
    },
 
    // 如何浏览器支持 mp3 文件格式返回 true 
    canPlayMp3: function () {
       return "" != this.audio.canPlayType('audio/mpeg');
    },
 
    // 从声音轨道数组soundChannels中返回第一个可用声音通道 
    getAvailableSoundChannel: function () {
       var audio;
       
       for (var i=0; i < this.NUM_SOUND_CHANNELS; ++i) {
          audio = this.soundChannels[i];
          // 判断该 audio 是否被占用
          if (audio.played.length === 0 || audio.ended) {
             return audio;
          }
       }
       return undefined; // all channels in use
    },
 
    // Given an identifier, play the associated sound 播放声音. 
    // 需要相应的audio元素标识符作为其参数。此方法会在第一个未被占用的声道上播放audio元素中的音源   
    playSound: function (id) {
       var channel = this.getAvailableSoundChannel(),
           element = document.getElementById(id);
 
       if (channel && element) {
          channel.src = element.src === '' ? element.currentSrc : element.src;
          channel.load();
          channel.play();
       }
    },

    
    // Sprites 精灵....................................................................

    // 为 game 添加一个精灵. 游戏引擎会在animate()方法中更新和会在精灵.    
    addSprite: function (sprite) {
       this.sprites.push(sprite);
    },
       
    // 最好不要直接访问某个精灵，最好是编写能够处理所有精灵的通用代码，因此应该谨慎使用这个方法
    // 通过name获取某个精灵
    getSprite: function (name) { 
       for(i in this.sprites) {
          if (this.sprites[i].name === name)
             return this.sprites[i];
       }
       return null;      
    },
 
    // 根据需要重写下列方法: 
    // 这些方法在 animate() 方法中按照下方列出的顺序被调用，你可以随心所欲地写它们
    startAnimate:      function (time) { }, 
    paintUnderSprites: function ()     { }, 
    paintOverSprites:  function ()     { }, 
    endAnimate:        function ()     { }  
 };