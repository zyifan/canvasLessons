
Stopwatch = function () {
};

// You can get the elapsed time while the timer is running, or after it's
// stopped.

Stopwatch.prototype = {
  startTime: 0,
  running: false,
  elapsed: undefined,

  // 开始监听，记录开始时间
  start: function () {
    this.startTime = +new Date();
    this.elapsedTime = undefined;
    this.running = true;
  },

  // 停止监听，记录动画耗时
  stop: function () {
    this.elapsed = (+new Date()) - this.startTime;
    this.running = false;
  },

  // 返回动画当前耗时
  getElapsedTime: function () {
    if (this.running) {
      return (+new Date()) - this.startTime;
    } else {
      return this.elapsed;
    }
  },

  // 返回动画是否在进行中
  isRunning: function () {
    return this.running;
  },

  // 重置时间
  reset: function () {
    this.elapsed = 0;
  }
};