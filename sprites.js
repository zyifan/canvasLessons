// 图像绘制器(对象)
var ImagePainter = function (imageUrl) {
    this.image = new Image;
    this.image.src = imageUrl;
};

//只要实现了excute(sprite, context, time) 方法的对象，都可以叫做‘行为’
ImagePainter.prototype = {
    image: undefined,

    paint: function (sprite, context) { //行为excute
        if (this.image !== undefined) {
            if (!this.image.complete) {        
                this.image.onload = function (e) {
                    // sprite.width = this.width;
                    // sprite.height = this.height;

                    context.drawImage(this,  // this is image
                        sprite.left, sprite.top,
                        sprite.width, sprite.height);
                };
            } else {
                // 绘制图像
                context.drawImage(this.image, sprite.left, sprite.top, sprite.width, sprite.height);
            }
        }
    }
};

//  精灵表绘制器
SpriteSheetPainter = function (cells) {
    this.cells = cells;
};

SpriteSheetPainter.prototype = {
    cells: [],
    cellIndex: 0,

    advance: function () {
        if (this.cellIndex == this.cells.length - 1) {
            this.cellIndex = 0;
        } else {
            this.cellIndex++;
        }
    },

    paint: function (sprite, context) {
        var cell = this.cells[this.cellIndex];
        context.drawImage(spritesheet, cell.left, cell.top,
            cell.width, cell.height,
            sprite.left, sprite.top,
            cell.width, cell.height);
    }
};

// Sprite Animators...........................................................

// Sprite animators have an array of painters that they succesively apply
// to a sprite over a period of time. Animators can be started with 
// start(sprite, durationInMillis, restoreSprite)

//精灵动画制作器
var SpriteAnimator = function (painters, elapsedCallback) {
    this.painters = painters;
    if (elapsedCallback) {
        this.elapsedCallback = elapsedCallback;
    }
};

SpriteAnimator.prototype = {
    painters: [],
    duration: 1000,
    startTime: 0,
    index: 0,
    elapsedCallback: undefined,

    end: function (sprite, originalPainter) {
        sprite.animating = false;
        console.log('end....');
        if (this.elapsedCallback) {
            this.elapsedCallback(sprite);
        } else {
            sprite.painter = originalPainter;
        }
    },

    // 不断切换sprite的painter
    start: function (sprite, duration) {
        var endTime = +new Date() + duration,
            period = duration / (this.painters.length),
            interval = undefined,
            animator = this, // for setInterval() function
            originalPainter = sprite.painter;

        this.index = 0;
        sprite.animating = true;
        sprite.painter = this.painters[this.index];

        interval = setInterval(function () {
            if (+new Date() <= endTime && animator.index < (animator.painters.length-1) ) {
                sprite.painter = animator.painters[++animator.index];
            } else {
                animator.end(sprite, originalPainter);
                clearInterval(interval);
            }
        }, period);
    },
};

// Sprites....................................................................

// Sprites have a name, a painter, and an array of behaviors. Sprites can be updated, and painted.
// sprite构造器，参数（精灵的名称、绘制器、行为数组）

var Sprite = function (name, painter, behaviors) {
    //精灵的名称
    if (name !== undefined) this.name = name;

    // 用于绘制此精灵对象的绘制器 paint(sprite, context)
    if (painter !== undefined) this.painter = painter; 
    
    // 一个包含精灵行行为对象的数组，在精灵执行更新逻辑时，该数组中的各行为对象都会被运用于此精灵 execute(sprite, context, time)
    if (behaviors !== undefined) this.behaviors = behaviors; 

    return this;
};

Sprite.prototype = {
    left: 0, // 精灵左上角的 X 坐标
    top: 0, // 精灵左上角（uper-left-hand-corner，简称 ulhc）的 Y 坐标
    width: 10, // 精灵的宽度
    height: 10, // 精灵的高度
    velocityX: 0, // 精灵的水平速度
    velocityY: 0, // 精灵的垂直速度
    visible: true, // 表示此精灵是否可见的boolean表中
    animating: false, // 表示此精灵是否正在执行动画效果的boolean标志
    painter: undefined, // object with paint(sprite, context)
    behaviors: [], // objects with execute(sprite, context, time) 

    paint: function (context) {
        if (this.painter !== undefined && this.visible) {
            this.painter.paint(this, context);// paint(sprite, context)
        }
    },

    // 倒序执行行为函数
    update: function (context, time) {
        for (var i = this.behaviors.length; i > 0; --i) {
            this.behaviors[i - 1].execute(this, context, time);// execute(sprite, context, time) 
        }
    }
};