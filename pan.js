var COREHTML5 = COREHTML5 || {};

// Constructor........................................................

COREHTML5.Pan = function (imageCanvas, image,
    viewportPercent, panCanvasAlpha) {
    var self = this;

    // Store arguments in member variables

    this.imageCanvas = imageCanvas;
    this.image = image;

    // 选框占比
    this.viewportPercent = viewportPercent || 10;
    // 浮框透明度
    this.panCanvasAlpha = panCanvasAlpha || 0.5;

    // Get a reference to the image canvas's context,
    // and create the pan canvas and the DOM element.
    // Put the pan canvas in the DOM element.

    // 大图画布
    this.imageContext = imageCanvas.getContext('2d');

    // 浮框
    this.panCanvas = document.createElement('canvas');
    this.panContext = this.panCanvas.getContext('2d');

    this.domElement = document.createElement('div');
    this.domElement.appendChild(this.panCanvas);

    // If the image is not loaded, initialize when the image loads;
    // otherwise, initialize now.

    if (image.width == 0 || image.height == 0) { // image not loaded
        image.onload = function (e) {
            self.initialize();
        };
    } else {
        this.initialize();
    }
    return this;
};

// Prototype..........................................................

COREHTML5.Pan.prototype = {
    initialize: function () {
        var width = this.image.width * (this.viewportPercent / 100),
            height = this.image.height * (this.viewportPercent / 100);

        // 为选框添加事件
        this.addEventHandlers();
        // 初始化选框数据
        this.setupViewport(width, height);
        // 为浮框dom元素添加样式 
        this.setupDOMElement(width, height);
        // 设置浮框的宽和高
        this.setupPanCanvas(width, height);
        // 绘制
        this.draw();
    },

    // 设置浮框的宽和高
    setupPanCanvas: function (w, h) {
        this.panCanvas.width = w;
        this.panCanvas.height = h;
    },

    // 为浮框dom元素添加样式 
    setupDOMElement: function (w, h) {
        this.domElement.style.width = w + 'px';
        this.domElement.style.height = h + 'px';
        this.domElement.className = 'pan';
    },

    // 初始化选框数据
    setupViewport: function (w, h) {
        this.viewportLocation = {
            x: 0,
            y: 0
        };
        this.viewportSize = {
            width: 50,
            height: 50
        };
        this.viewportLastLocation = {
            x: 0,
            y: 0
        };

        this.viewportSize.width = this.imageCanvas.width *
            this.viewportPercent / 100;

        this.viewportSize.height = this.imageCanvas.height *
            this.viewportPercent / 100;
    },

    // 移动选框
    moveViewport: function (mouse, offset) {
        this.viewportLocation.x = mouse.x - offset.x;
        this.viewportLocation.y = mouse.y - offset.y;

        // 鼠标移动距离
        var delta = {
            x: this.viewportLastLocation.x - this.viewportLocation.x,
            y: this.viewportLastLocation.y - this.viewportLocation.y
        };

        // 移动图片
        this.imageContext.translate(
            delta.x * (this.image.width / this.panCanvas.width),
            delta.y * (this.image.height / this.panCanvas.height));
        
        // 存储最新位置
        this.viewportLastLocation.x = this.viewportLocation.x;
        this.viewportLastLocation.y = this.viewportLocation.y;
    },

    // 判断鼠标是否在选框内
    isPointInViewport: function (x, y) {
        this.panContext.beginPath();
        this.panContext.rect(this.viewportLocation.x,
            this.viewportLocation.y,
            this.viewportSize.width,
            this.viewportSize.height);

        return this.panContext.isPointInPath(x, y);
    },

    addEventHandlers: function () {
        var pan = this;

        pan.domElement.onmousedown = function (e) {
            var mouse = pan.windowToCanvas(e.clientX, e.clientY),
                offset = null;

            e.preventDefault();

            // 判断鼠标是否在选框内
            if (pan.isPointInViewport(mouse.x, mouse.y)) {
                offset = {
                    x: mouse.x - pan.viewportLocation.x,
                    y: mouse.y - pan.viewportLocation.y
                };

                pan.panCanvas.onmousemove = function (e) {
                    pan.erase();

                    // 移动选框和图片
                    pan.moveViewport(
                        pan.windowToCanvas(e.clientX, e.clientY), offset);

                    // 绘制
                    pan.draw();
                };

                pan.panCanvas.onmouseup = function (e) {
                    pan.panCanvas.onmousemove = undefined;
                    pan.panCanvas.onmouseup = undefined;
                };
            }
        };
    },

    erase: function () {
        this.panContext.clearRect(0, 0,
            this.panContext.canvas.width,
            this.panContext.canvas.height);
    },

    // 绘制浮框内的图片
    drawPanCanvas: function (alpha) {
        this.panContext.save();
        this.panContext.globalAlpha = alpha;
        this.panContext.drawImage(this.image,
            0, 0,
            this.image.width,
            this.image.height,
            0, 0,
            this.panCanvas.width,
            this.panCanvas.height);
        this.panContext.restore();
    },

    // 绘制图片    
    drawImageCanvas: function () {
        this.imageContext.drawImage(this.image,
            0, 0,
            this.image.width,
            this.image.height);
    },

    // 绘制浮框样式
    drawViewport: function () {
        this.panContext.shadowColor = 'rgba(0,0,0,0.4)';
        this.panContext.shadowOffsetX = 2;
        this.panContext.shadowOffsetY = 2;
        this.panContext.shadowBlur = 3;

        this.panContext.lineWidth = 3;
        this.panContext.strokeStyle = 'white';
        this.panContext.strokeRect(this.viewportLocation.x,
            this.viewportLocation.y,
            this.viewportSize.width,
            this.viewportSize.height);
    },

    // 绘制选框剪辑区域
    clipToViewport: function () {
        this.panContext.beginPath();
        this.panContext.rect(this.viewportLocation.x,
            this.viewportLocation.y,
            this.viewportSize.width,
            this.viewportSize.height);
        this.panContext.clip();
    },

    // 绘制
    draw: function () {
        // 绘制图片
        this.drawImageCanvas();
        
        // 绘制浮框
        this.drawPanCanvas(this.panCanvasAlpha);

        // 绘制选框 
        this.panContext.save();
        this.clipToViewport();
        // 再次绘制图片，只会在选框剪辑区域内绘制
        this.drawPanCanvas(1.0);
        this.panContext.restore();

        // 绘制选框样式
        this.drawViewport();
    },

    windowToCanvas: function (x, y) {
        var bbox = this.panCanvas.getBoundingClientRect();

        return {
            x: x - bbox.left * (this.panCanvas.width / bbox.width),
            y: y - bbox.top * (this.panCanvas.height / bbox.height)
        };
    },
};