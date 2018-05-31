// AnimationTimer..................................................................
//
// An animation runs for a duration, in milliseconds. It's up to you,
// however, to start and stop the animation -- animations do not stop
// automatically. You can check to see if an animation is over with the
// isOver() method, and you can see if an animation is running with
// isRunning(). Note that animations can be over, but still running.
//
// You can also supply an optional timeWarp function that warps the percent
// completed for the animation. That warping lets you do easily incorporate
// non-linear motion, such as: ease-in, ease-out, elastic, etc.

AnimationTimer = function (duration, timeWarp) {
    this.timeWarp = timeWarp;

    if (duration !== undefined) this.duration = duration;
    else this.duration = 1000;

    this.stopwatch = new Stopwatch();//创建监听器
};

AnimationTimer.prototype = {
    start: function () {
        this.stopwatch.start();//开启动画状态，记录开始时间
    },

    stop: function () {
        this.stopwatch.stop();//关闭动画状态，记录动画耗时
    },

    getRealElapsedTime: function () {
        return this.stopwatch.getElapsedTime();//获取动画当前耗时
    },

    getElapsedTime: function () {
        var elapsedTime = this.stopwatch.getElapsedTime(),
            percentComplete = elapsedTime / this.duration; //动画当前播放进度百分比

        if (!this.stopwatch.running) return undefined; //如果动画已结束，返回undefined
        
        if (this.timeWarp == undefined) return elapsedTime; //如果timeWarp不存在，返回动画耗时

        // timeWarp 时间扭曲函数，返回一个扭曲后的播放进度百分比
        // this.timeWarp(percentComplete) / percentComplete 实际播放百分比与扭曲后的比值
        // 有了比值之后，将实际动画播放时间乘以扭曲后的比值与实际播放百分比之商，以此得到扭曲后的动画播放时间，并将其返回
        return elapsedTime * (this.timeWarp(percentComplete) / percentComplete); //返回被 timeWarp 处理过的 duration
    },

    isRunning: function () {
        return this.stopwatch.running;//获取动画结束状态
    },

    isOver: function () {
        return this.stopwatch.getElapsedTime() > this.duration; //判断动画是否结束
    },

    reset: function () {
        this.stopwatch.reset(); //重置动画时间为0
    }
};

// 缓出动画
AnimationTimer.makeEaseOut = function (strength) {
    return function (percentComplete) {
        return 1 - Math.pow(1 - percentComplete, strength * 2); //pow(x, y) 方法可返回 x 的 y 次幂的值
    };
};

// 缓入动画
AnimationTimer.makeEaseIn = function (strength) {
    return function (percentComplete) {
        return Math.pow(percentComplete, strength * 2);
    };
};

// 缓入缓出动画
AnimationTimer.makeEaseInOut = function () {
    return function (percentComplete) {
        return percentComplete - Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI);
    };
};

// 弹簧 passes弹跳次数
AnimationTimer.makeElastic = function (passes) {
    passes = passes || 3;
    return function (percentComplete) {
        return ((1 - Math.cos(percentComplete * Math.PI * passes)) *
            (1 - percentComplete)) + percentComplete;
    };
};

// 弹跳
AnimationTimer.makeBounce = function (bounces) {
    var fn = AnimationTimer.makeElastic(bounces);
    return function (percentComplete) {
        percentComplete = fn(percentComplete);
        return percentComplete <= 1 ? percentComplete : 2 - percentComplete;
    };
};

// 匀速
AnimationTimer.makeLinear = function () {
    return function (percentComplete) {
        return percentComplete;
    };
};