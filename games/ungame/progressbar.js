var COREHTML5 = COREHTML5 || {}

COREHTML5.Progressbar = function (w, h, strokeStyle, red, green, blue) {
    // 创建导航条el元素和canvas元素
    this.domElement = document.createElement('div');
    this.context = document.createElement('canvas').getContext('2d');
    this.domElement.appendChild(this.context.canvas);

    // 两端圆弧半径为高的的一半 r = h/2 ，w = h/2 + h/2
    this.context.canvas.width = w + h; // On each end, corner radius = h/2
    this.context.canvas.height = h;

    this.setProgressbarProperties(w, h);

    this.background.globalAlpha = 0.3; //底部canvas透明度为0.3
    this.drawToBuffer(this.background, strokeStyle, red, green, blue);
    this.drawToBuffer(this.foreground, strokeStyle, red, green, blue);

    this.percentComplete = 0;
    return this;
}

COREHTML5.Progressbar.prototype = {
    LEFT: 0,
    TOP: 0,

    // 初始化canvas和坐标半径，再创建两个离屏canvas，分别放置背景和进度条
    setProgressbarProperties: function (w, h) {
        this.w = w;
        this.h = h;
        this.cornerRadius = this.h / 2; //两端圆弧半径
        this.right = this.LEFT + this.cornerRadius + this.w + this.cornerRadius; //右侧位置坐标
        this.bottom = this.TOP + this.h; //底部位置坐标

        // 底部canvas
        this.background = document.createElement('canvas').getContext('2d');
        // 顶部canvas
        this.foreground = document.createElement('canvas').getContext('2d');

        this.background.canvas.width = w + h; // On each end, corner radius = h/2
        this.background.canvas.height = h;

        this.foreground.canvas.width = w + h; // On each end, corner radius = h/2
        this.foreground.canvas.height = h;
    },

    draw: function (percentComplete) {
        // 擦除canvas面板
        this.erase();
        // 绘制进度条背景canvas
        this.context.drawImage(this.background.canvas, 0, 0);

        // 绘制进度条canvas
        if (percentComplete > 0) {
            this.context.drawImage(this.foreground.canvas, 0, 0,
                this.foreground.canvas.width * (percentComplete / 100),
                this.foreground.canvas.height,
                0, 0,
                this.foreground.canvas.width * (percentComplete / 100),
                this.foreground.canvas.height);
        }
    },

    // 绘制进度条
    drawToBuffer: function (context, strokeStyle, red, green, blue) {
        context.save();

        // canvas 背景颜色
        context.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        context.strokeStyle = strokeStyle;

        context.beginPath();

        // 上方横线
        context.moveTo(this.LEFT + this.cornerRadius, this.TOP);
        context.lineTo(this.right - this.cornerRadius, this.TOP);

        // 右侧端点半圆
        context.arc(this.right - this.cornerRadius,
            this.TOP + this.cornerRadius, this.cornerRadius, -Math.PI / 2, Math.PI / 2);

        // 底部横向
        context.lineTo(this.LEFT + this.cornerRadius,
            this.TOP + this.cornerRadius * 2);

        // 左侧端点半圆
        context.arc(this.LEFT + this.cornerRadius,
            this.TOP + this.cornerRadius, this.cornerRadius, Math.PI / 2, -Math.PI / 2);

        context.fill();

        context.shadowColor = undefined;
        
        // 在背景颜色上添加白色横条
        var gradient = context.createLinearGradient(this.LEFT, this.TOP, this.LEFT, this.bottom);
        gradient.addColorStop(0, 'rgba(255,255,255,0.4)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.7)');
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.1)');
        context.fillStyle = gradient;
        context.fill();

        context.lineWidth = 0.4;
        context.stroke();

        context.restore();
    },

    // 擦除进度条
    erase: function () {
        this.context.clearRect(this.LEFT, this.TOP, this.context.canvas.width, this.context.canvas.height);
    }
};