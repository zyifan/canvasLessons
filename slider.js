var COREHTML5 = COREHTML5 || {}

// Constructor........................................................

COREHTML5.Slider = function (strokeStyle, fillStyle,
    knobPercent, hpercent, vpercent) {
    // hpercent 滑竿在父容器中宽度占比
    // vpercent 滑竿在父容器中高度占比  
    // 绘制圆角矩形
    this.trough = new COREHTML5.RoundedRectangle(strokeStyle, fillStyle,
        hpercent || 95, // horizontal size percent
        vpercent || 55); // vertical size percent

    this.knobPercent = knobPercent || 0; // 按钮在滑竿上的位置比例
    this.strokeStyle = strokeStyle ? strokeStyle : 'gray';
    this.fillStyle = fillStyle ? fillStyle : 'skyblue';

    this.SHADOW_COLOR = 'rgba(100, 100, 100, 0.8)';
    this.SHADOW_OFFSET_X = 3;
    this.SHADOW_OFFSET_Y = 3;

    this.HORIZONTAL_MARGIN = 2 * this.SHADOW_OFFSET_X;
    this.VERTICAL_MARGIN = 2 * this.SHADOW_OFFSET_Y;

    this.KNOB_SHADOW_COLOR = 'yellow';
    this.KNOB_SHADOW_OFFSET_X = 1;
    this.KNOB_SHADOW_OFFSET_Y = 1;
    this.KNOB_SHADOW_BLUR = 0;

    this.KNOB_FILL_STYLE = 'rgba(255,255,255,0.45)';
    this.KNOB_STROKE_STYLE = 'rgba(0, 0, 150, 0.45)';

    this.context = document.createElement('canvas').getContext('2d'); // 创建canvas对象
    this.changeEventListeners = [];

    // 创建div对象
    this.createDOMElement();
    // 添加鼠标事件
    this.addMouseHandlers();

    return this;
}

// Prototype..........................................................

COREHTML5.Slider.prototype = {

    // General functions to override...................................
    // 创建div对象，并将canvas出入到div
    createDOMElement: function () {
        this.domElement = document.createElement('div');
        this.domElement.appendChild(this.context.canvas);
    },
    // 将div插入到 element中
    appendTo: function (elementName) {
        document.getElementById(elementName).
        appendChild(this.domElement);

        this.setCanvasSize(); // 重置canvas大小
        this.resize(); // 重置位置坐标
    },
    // 重置canvas大小， 获取div的父元素 element ，并将父元素的宽高设置到canvas之上
    setCanvasSize: function () {
        var domElementParent = this.domElement.parentNode;

        this.context.canvas.width = domElementParent.offsetWidth;
        this.context.canvas.height = domElementParent.offsetHeight;
    },
    // 重置位置坐标
    resize: function () {
        this.cornerRadius = (this.context.canvas.height / 2 - 2 * this.VERTICAL_MARGIN) / 2; // 获取半径

        this.top = this.HORIZONTAL_MARGIN;
        this.left = this.VERTICAL_MARGIN;

        this.right = this.left + this.context.canvas.width - 2 * this.HORIZONTAL_MARGIN;

        this.bottom = this.top + this.context.canvas.height - 2 * this.VERTICAL_MARGIN;

        // 重置圆角矩形大小
        this.trough.resize(this.context.canvas.width, this.context.canvas.height);

        this.knobRadius = this.context.canvas.height / 2 - this.context.lineWidth * 2; // 按钮半径
    },

    // Event Handlers..................................................
    // 为div添加 mouseover、mousedown、mouseup 事件
    addMouseHandlers: function () {
        var slider = this; // Let div's event handlers access this object

        this.domElement.onmouseover = function (e) {
            slider.context.canvas.style.cursor = 'crosshair';
        };

        this.domElement.onmousedown = function (e) {
            var mouse = slider.windowToCanvas(e.clientX, e.clientY); // 获取初始坐标

            e.preventDefault();

            // 如果鼠标在滑杆或者滑块内
            if (slider.mouseInTrough(mouse) || slider.mouseInKnob(mouse)) {
                slider.knobPercent = slider.knobPositionToPercent(mouse.x);
                slider.fireChangeEvent(e);
                slider.erase();
                slider.draw();
                slider.dragging = true;
            }
        };

        window.addEventListener('mousemove', function (e) {
            var mouse = null,
                percent = null;

            e.preventDefault();

            if (slider.dragging) {
                mouse = slider.windowToCanvas(e.clientX, e.clientY);
                percent = slider.knobPositionToPercent(mouse.x);

                if (percent >= 0 && percent <= 1.0) {
                    slider.fireChangeEvent(e);
                    slider.erase();
                    slider.draw(percent);
                }
            }
        }, false);

        window.addEventListener('mouseup', function (e) {
            var mouse = null;

            e.preventDefault();

            if (slider.dragging) {
                slider.fireChangeEvent(e);
                slider.dragging = false;
            }
        }, false);
    },

    // Change Events...................................................
    // 触发事件
    fireChangeEvent: function (e) {
        for (var i = 0; i < this.changeEventListeners.length; ++i) {
            this.changeEventListeners[i](e);
        }
    },

    addChangeListener: function (listenerFunction) {
        this.changeEventListeners.push(listenerFunction);
    },

    // Utility Functions...............................................
    // 判断坐标是否在按钮内
    mouseInKnob: function (mouse) {
        var position = this.knobPercentToPosition(this.knobPercent); // 根据百分百获取 按钮中心点 横坐标
        this.context.beginPath();
        this.context.arc(position, this.context.canvas.height / 2, this.knobRadius, 0, Math.PI * 2);

        return this.context.isPointInPath(mouse.x, mouse.y);
    },
    // 判断鼠标坐标是否在div方框之内
    mouseInTrough: function (mouse) {
        this.context.beginPath();
        this.context.rect(this.left, 0,
            this.right - this.left, this.bottom);

        return this.context.isPointInPath(mouse.x, mouse.y);
    },
    // 鼠标坐标转换为canvas坐标
    windowToCanvas: function (x, y) {
        var bbox = this.context.canvas.getBoundingClientRect();

        return {
            x: x - bbox.left * (this.context.canvas.width / bbox.width),
            y: y - bbox.top * (this.context.canvas.height / bbox.height)
        };
    },
    // 将中心点坐标转换为百分比
    knobPositionToPercent: function (position) {
        var troughWidth = this.right - this.left - 2 * this.knobRadius;
        return (position - this.left - this.knobRadius) / troughWidth;
    },
    // 根据百分百获取 按钮中心点 横坐标
    knobPercentToPosition: function (percent) {
        if (percent > 1) percent = 1;
        if (percent < 0) percent = 0;
        var troughWidth = this.right - this.left - 2 * this.knobRadius;
        return percent * troughWidth + this.left + this.knobRadius;
    },

    // Drawing Functions...............................................

    // 绘制按钮    
    fillKnob: function (position) {
        this.context.save();

        this.context.shadowColor = this.KNOB_SHADOW_COLOR;
        this.context.shadowOffsetX = this.KNOB_SHADOW_OFFSET_X;
        this.context.shadowOffsetY = this.KNOB_SHADOW_OFFSET_Y;
        this.context.shadowBlur = this.KNOB_SHADOW_BLUR;

        this.context.beginPath();

        this.context.arc(position,
            this.top + ((this.bottom - this.top) / 2),
            this.knobRadius, 0, Math.PI * 2, false);

        this.context.clip();

        this.context.fillStyle = this.KNOB_FILL_STYLE;
        this.context.fill();
        this.context.restore();
    },

    strokeKnob: function () {
        this.context.save();
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.KNOB_STROKE_STYLE;
        this.context.stroke();
        this.context.restore();
    },
    // 绘制按钮
    drawKnob: function (percent) {
        if (percent < 0) percent = 0;
        if (percent > 1) percent = 1;

        this.knobPercent = percent;
        // 绘制按钮
        this.fillKnob(this.knobPercentToPosition(percent));
        this.strokeKnob();
    },
    // 绘制圆角矩形
    drawTrough: function () {
        this.context.save();
        this.trough.fillStyle = this.fillStyle;
        this.trough.strokeStyle = this.strokeStyle;
        this.trough.draw(this.context);
        this.context.restore();
    },
    // 绘制圆角矩形
    draw: function (percent) {
        this.context.globalAlpha = this.opacity;

        if (percent === undefined) {
            percent = this.knobPercent;
        }

        this.drawTrough(); // 绘制圆角矩形
        this.drawKnob(percent); // 绘制按钮
    },
    // 擦除
    erase: function () {
        this.context.clearRect(
            this.left - this.knobRadius, 0 - this.knobRadius,
            this.context.canvas.width + 4 * this.knobRadius,
            this.context.canvas.height + 3 * this.knobRadius);
    }
};