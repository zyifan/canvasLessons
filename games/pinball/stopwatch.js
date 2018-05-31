// Stopwatch..................................................................

//
// Like the real thing, you can start and stop a stopwatch, and you can
// find out the elapsed time the stopwatch has been running. After you stop
// a stopwatch, it's getElapsedTime() method returns the elapsed time
// between the start and stop.

Stopwatch = function () {};

// You can get the elapsed time while the timer is running, or after it's
// stopped.

Stopwatch.prototype = {
    startTime: 0,
    running: false,
    elapsedTime: 0,

    start: function () {
        this.startTime = +new Date();
        this.elapsedTime = 0;
        this.running = true;
    },

    stop: function () {
        this.elapsedTime = +new Date() - this.startTime;
        this.running = false;
    },

    getElapsedTime: function () {
        if (this.running) return +new Date() - this.startTime;
        else return this.elapsedTime;
    },

    reset: function () {
        this.elapsedTime = 0;
        this.startTime = 0;
        this.running = false;
    }
};