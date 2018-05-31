// AnimationTimer..................................................................

AnimationTimer = function (duration, timeWarp) {
    this.timeWarp = timeWarp;

    if (duration !== undefined) this.duration = duration;
    else this.duration = 1000;

    this.stopwatch = new Stopwatch();
};

AnimationTimer.prototype = {
    start: function () {
        this.stopwatch.start();
    },

    stop: function () {
        this.stopwatch.stop();
    },

    getRealElapsedTime: function () {
        return this.stopwatch.getElapsedTime();
    },

    getElapsedTime: function () {
        var elapsedTime = this.stopwatch.getElapsedTime(),
            percentComplete = elapsedTime / this.duration;

        if (!this.stopwatch.running) return undefined;
        if (this.timeWarp == undefined) return elapsedTime;//如果timeWarp不存在，返回动画耗时

        // timeWarp 时间扭曲函数，返回一个扭曲后的播放进度百分比
        // this.timeWarp(percentComplete) / percentComplete 实际播放百分比与扭曲后的比值
        // 有了比值之后，将实际动画播放时间乘以扭曲后的比值与实际播放百分比之商，以此得到扭曲后的动画播放时间，并将其返回
        return elapsedTime * (this.timeWarp(percentComplete) / percentComplete);
    },

    isRunning: function () {
        return this.stopwatch.running;
    },

    isOver: function () {
        return this.stopwatch.getElapsedTime() > this.duration;
    },

    reset: function () {
        this.stopwatch.reset();
    }
};

AnimationTimer.makeEaseOut = function (strength) {
    return function (percentComplete) {
        return 1 - Math.pow(1 - percentComplete, strength * 2);
    };
};

AnimationTimer.makeEaseIn = function (strength) {
    return function (percentComplete) {
        return Math.pow(percentComplete, strength * 2);
    };
};

AnimationTimer.makeEaseInOut = function () {
    return function (percentComplete) {
        return percentComplete - Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI);
    };
};

AnimationTimer.makeElastic = function (passes) {
    passes = passes || 3;
    return function (percentComplete) {
        return ((1 - Math.cos(percentComplete * Math.PI * passes)) *
            (1 - percentComplete)) + percentComplete;
    };
};

AnimationTimer.makeBounce = function (bounces) {
    var fn = AnimationTimer.makeElastic(bounces);
    return function (percentComplete) {
        percentComplete = fn(percentComplete);
        return percentComplete <= 1 ? percentComplete : 2 - percentComplete;
    };
};

AnimationTimer.makeLinear = function () {
    return function (percentComplete) {
        return percentComplete;
    };
};