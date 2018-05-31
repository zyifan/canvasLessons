var COREHTML5 = COREHTML5 || {};

COREHTML5.bottomRightTimeBasedMotion = function () {
    var canvas = document.querySelector('#bottomCanvas'),//获取canvas对象
        context = canvas.getContext('2d'),
        paused = true,
        // 圆球参数
        discs = [
            {
                x: 150,
                y: 250,
                lastX: 150,
                lastY: 250,
                velocityX: -3.2,
                velocityY: 3.5,
                radius: 25,
                innerColor: 'rgba(255,255,0,1)',
                middleColor: 'rgba(255,255,0,0.7)',
                outerColor: 'rgba(255,255,0,0.5)',
                shadowColor: 'rgba(175,175,175,0.7)',
                strokeStyle: 'gray',
            },

            {
                x: 50,
                y: 150,
                lastX: 50,
                lastY: 150,
                velocityX: 2.2,
                velocityY: 2.5,
                radius: 25,
                innerColor: 'rgba(100,145,230,1.0)',
                middleColor: 'rgba(100,145,230,0.7)',
                outerColor: 'rgba(100,145,230,0.5)',
                shadowColor: 'rgba(100,145,230,0.8)',
                strokeStyle: 'blue'
            },

            {
                x: 150,
                y: 75,
                lastX: 150,
                lastY: 75,
                velocityX: 1.2,
                velocityY: 1.5,
                radius: 25,
                innerColor: 'rgba(255,0,0,1.0)',
                middleColor: 'rgba(255,0,0,0.7)',
                outerColor: 'rgba(255,0,0,0.5)',
                shadowColor: 'rgba(255,0,0,0.7)',
                strokeStyle: 'orange'
            },
            {
                x: 50,
                y: 150,
                lastX: 150,
                lastY: 250,
                velocityX: -3.2,
                velocityY: -3.5,
                radius: 25,
                innerColor: 'rgba(255,255,0,1)',
                middleColor: 'rgba(255,255,0,0.7)',
                outerColor: 'rgba(255,255,0,0.5)',
                shadowColor: 'rgba(175,175,175,0.7)',
                strokeStyle: 'gray',
            },

            {
                x: 50,
                y: 75,
                lastX: 50,
                lastY: 150,
                velocityX: 2.2,
                velocityY: -2.5,
                radius: 25,
                innerColor: 'rgba(100,145,230,1.0)',
                middleColor: 'rgba(100,145,230,0.7)',
                outerColor: 'rgba(100,145,230,0.5)',
                shadowColor: 'rgba(100,145,230,0.8)',
                strokeStyle: 'blue'
            },

            {
                x: 200,
                y: 175,
                lastX: 150,
                lastY: 75,
                velocityX: -1.9,
                velocityY: 1.2,
                radius: 25,
                innerColor: 'rgba(255,0,0,1.0)',
                middleColor: 'rgba(255,0,0,0.7)',
                outerColor: 'rgba(255,0,0,0.5)',
                shadowColor: 'rgba(255,0,0,0.7)',
                strokeStyle: 'orange'
            },
            {
                x: 250,
                y: 250,
                lastX: 150,
                lastY: 250,
                velocityX: 5.2,
                velocityY: -3.5,
                radius: 25,
                innerColor: 'rgba(255,255,0,1)',
                middleColor: 'rgba(255,255,0,0.7)',
                outerColor: 'rgba(255,255,0,0.5)',
                shadowColor: 'rgba(175,175,175,0.7)',
                strokeStyle: 'gray',
            },

            {
                x: 150,
                y: 100,
                lastX: 50,
                lastY: 150,
                velocityX: -2.9,
                velocityY: -1.5,
                radius: 25,
                innerColor: 'rgba(100,145,230,1.0)',
                middleColor: 'rgba(100,145,230,0.7)',
                outerColor: 'rgba(100,145,230,0.5)',
                shadowColor: 'rgba(100,145,230,0.8)',
                strokeStyle: 'blue'
            },

            {
                x: 215,
                y: 175,
                lastX: 150,
                lastY: 75,
                velocityX: -2.2,
                velocityY: 2.5,
                radius: 25,
                innerColor: 'rgba(255,0,0,1.0)',
                middleColor: 'rgba(255,0,0,0.7)',
                outerColor: 'rgba(255,0,0,0.5)',
                shadowColor: 'rgba(255,0,0,0.7)',
                strokeStyle: 'orange'
            },
            {
                x: 250,
                y: 150,
                lastX: 150,
                lastY: 250,
                velocityX: 4.2,
                velocityY: -5.5,
                radius: 25,
                innerColor: 'rgba(255,255,0,1)',
                middleColor: 'rgba(255,255,0,0.7)',
                outerColor: 'rgba(255,255,0,0.5)',
                shadowColor: 'rgba(175,175,175,0.7)',
                strokeStyle: 'gray',
            },

            {
                x: 150,
                y: 75,
                lastX: 50,
                lastY: 150,
                velocityX: 3.2,
                velocityY: -3.5,
                radius: 25,
                innerColor: 'rgba(100,145,230,1.0)',
                middleColor: 'rgba(100,145,230,0.7)',
                outerColor: 'rgba(100,145,230,0.5)',
                shadowColor: 'rgba(100,145,230,0.8)',
                strokeStyle: 'blue'
            },

            {
                x: 100,
                y: 100,
                lastX: 150,
                lastY: 75,
                velocityX: -2.9,
                velocityY: -2.2,
                radius: 25,
                innerColor: 'rgba(255,0,0,1.0)',
                middleColor: 'rgba(255,0,0,0.7)',
                outerColor: 'rgba(255,0,0,0.5)',
                shadowColor: 'rgba(255,0,0,0.7)',
                strokeStyle: 'orange'
            },
            {
                x: 150,
                y: 250,
                lastX: 150,
                lastY: 250,
                velocityX: -5.2,
                velocityY: 5.5,
                radius: 25,
                innerColor: 'rgba(255,255,0,1)',
                middleColor: 'rgba(255,255,0,0.7)',
                outerColor: 'rgba(255,255,0,0.5)',
                shadowColor: 'rgba(175,175,175,0.7)',
                strokeStyle: 'gray',
            },

            {
                x: 50,
                y: 150,
                lastX: 50,
                lastY: 150,
                velocityX: 4.2,
                velocityY: 4.5,
                radius: 25,
                innerColor: 'rgba(100,145,230,1.0)',
                middleColor: 'rgba(100,145,230,0.7)',
                outerColor: 'rgba(100,145,230,0.5)',
                shadowColor: 'rgba(100,145,230,0.8)',
                strokeStyle: 'blue'
            },

            {
                x: 150,
                y: 75,
                lastX: 150,
                lastY: 75,
                velocityX: 2.2,
                velocityY: 2.5,
                radius: 25,
                innerColor: 'rgba(255,0,0,1.0)',
                middleColor: 'rgba(255,0,0,0.7)',
                outerColor: 'rgba(255,0,0,0.5)',
                shadowColor: 'rgba(255,0,0,0.7)',
                strokeStyle: 'orange'
            },
            {
                x: 50,
                y: 150,
                lastX: 150,
                lastY: 250,
                velocityX: -0.2,
                velocityY: -1.5,
                radius: 25,
                innerColor: 'rgba(255,255,0,1)',
                middleColor: 'rgba(255,255,0,0.7)',
                outerColor: 'rgba(255,255,0,0.5)',
                shadowColor: 'rgba(175,175,175,0.7)',
                strokeStyle: 'gray',
            },

            {
                x: 50,
                y: 75,
                lastX: 50,
                lastY: 150,
                velocityX: 1.2,
                velocityY: -2.5,
                radius: 25,
                innerColor: 'rgba(100,145,230,1.0)',
                middleColor: 'rgba(100,145,230,0.7)',
                outerColor: 'rgba(100,145,230,0.5)',
                shadowColor: 'rgba(100,145,230,0.8)',
                strokeStyle: 'blue'
            },

            {
                x: 200,
                y: 175,
                lastX: 150,
                lastY: 75,
                velocityX: 1.9,
                velocityY: -1.2,
                radius: 25,
                innerColor: 'rgba(255,0,0,1.0)',
                middleColor: 'rgba(255,0,0,0.7)',
                outerColor: 'rgba(255,0,0,0.5)',
                shadowColor: 'rgba(255,0,0,0.7)',
                strokeStyle: 'orange'
            },
            {
                x: 250,
                y: 250,
                lastX: 150,
                lastY: 250,
                velocityX: 3.2,
                velocityY: -5.5,
                radius: 25,
                innerColor: 'rgba(255,255,0,1)',
                middleColor: 'rgba(255,255,0,0.7)',
                outerColor: 'rgba(255,255,0,0.5)',
                shadowColor: 'rgba(175,175,175,0.7)',
                strokeStyle: 'gray',
            },

            {
                x: 150,
                y: 100,
                lastX: 50,
                lastY: 150,
                velocityX: -1.9,
                velocityY: -2.5,
                radius: 25,
                innerColor: 'rgba(100,145,230,1.0)',
                middleColor: 'rgba(100,145,230,0.7)',
                outerColor: 'rgba(100,145,230,0.5)',
                shadowColor: 'rgba(100,145,230,0.8)',
                strokeStyle: 'blue'
            },

            {
                x: 215,
                y: 175,
                lastX: 150,
                lastY: 75,
                velocityX: -3.2,
                velocityY: 4.5,
                radius: 25,
                innerColor: 'rgba(255,0,0,1.0)',
                middleColor: 'rgba(255,0,0,0.7)',
                outerColor: 'rgba(255,0,0,0.5)',
                shadowColor: 'rgba(255,0,0,0.7)',
                strokeStyle: 'orange'
            },
            {
                x: 250,
                y: 150,
                lastX: 150,
                lastY: 250,
                velocityX: 2.2,
                velocityY: -4.5,
                radius: 25,
                innerColor: 'rgba(255,255,0,1)',
                middleColor: 'rgba(255,255,0,0.7)',
                outerColor: 'rgba(255,255,0,0.5)',
                shadowColor: 'rgba(175,175,175,0.7)',
                strokeStyle: 'gray',
            },

            {
                x: 150,
                y: 75,
                lastX: 50,
                lastY: 150,
                velocityX: 2.2,
                velocityY: -1.5,
                radius: 25,
                innerColor: 'rgba(100,145,230,1.0)',
                middleColor: 'rgba(100,145,230,0.7)',
                outerColor: 'rgba(100,145,230,0.5)',
                shadowColor: 'rgba(100,145,230,0.8)',
                strokeStyle: 'blue'
            },

            {
                x: 100,
                y: 100,
                lastX: 150,
                lastY: 75,
                velocityX: -5.9,
                velocityY: -0.2,
                radius: 25,
                innerColor: 'rgba(255,0,0,1.0)',
                middleColor: 'rgba(255,0,0,0.7)',
                outerColor: 'rgba(255,0,0,0.5)',
                shadowColor: 'rgba(255,0,0,0.7)',
                strokeStyle: 'orange'
            },
        ],
        numDiscs = discs.length,// 圆球个数
        startTime = 0, // 帧开始时间
        lastTime = 0, // 帧结束时间
        elapsedTime = 0, // 间隔时间
        fps = 0, //帧速率
        lastFpsUpdate = { time: 0, value: 0 },

        animateButton = document.querySelector('#bottomAnimateButton'), // 播放按钮

        // 是否基于时间运动
        timeBasedMotionCheckbox = document.querySelector('#timeBasedMotionCheckbox'),
        timeBasedMotion = timeBasedMotionCheckbox.checked;

    // 擦除canvas
    function eraseBackground() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 绘制网格
    function drawBackground() {
        var STEP_Y = 12,
            i = context.canvas.height;

        context.strokeStyle = 'lightgray';
        context.lineWidth = 0.5;

        context.save();
        context.restore();

        while (i > STEP_Y * 4) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(context.canvas.width, i);
            context.stroke();
            i -= STEP_Y;
        }

        context.save();

        context.strokeStyle = 'rgba(100,0,0,0.3)';
        context.lineWidth = 1;

        context.beginPath();

        context.moveTo(35, 0);
        context.lineTo(35, context.canvas.height);
        context.stroke();

        context.restore();
    }

    // 更新圆球坐标（根据帧速率）
    function update() {
        var i = numDiscs,
            disc = null;

        while (i--) {
            disc = discs[i];

            if (disc.x + disc.velocityX + disc.radius > context.canvas.width ||
                disc.x + disc.velocityX - disc.radius < 0)
                disc.velocityX = -disc.velocityX; // 每帧运动的距离一样 velocityX

            if (disc.y + disc.velocityY + disc.radius > context.canvas.height ||
                disc.y + disc.velocityY - disc.radius < 0)
                disc.velocityY = -disc.velocityY;

            disc.x += disc.velocityX;
            disc.y += disc.velocityY;
        }
    }

    // 更新圆球坐标（根据时间）
    function updateTimeBased(time) {
        var i = numDiscs,
            disc = null;

        if (fps == 0)
            return;

        while (i--) {
            disc = discs[i];

            // 根据帧速率计算一帧可以运动多远距离 deltaX，（ 1s运行velocityX距离 / 1s可以绘制多少帧 = 1帧可以运行多远deltaX）
            deltaX = disc.velocityX / fps; 
            deltaY = disc.velocityY / fps;

            if (disc.x + deltaX + disc.radius > context.canvas.width ||
                disc.x + deltaX - disc.radius < 0) {
                disc.velocityX = -disc.velocityX;
                deltaX = -deltaX;
            }

            if (disc.y + deltaY + disc.radius > context.canvas.height ||
                disc.y + deltaY - disc.radius < 0) {
                disc.velocityY = -disc.velocityY;
                deltaX = -deltaX;
            }

            disc.x = disc.x + deltaX;
            disc.y = disc.y + deltaY;
        }
    }

    // 绘制圆球
    function draw() {
        var i = numDiscs,
            disc = discs[i];

        while (i--) {
            disc = discs[i];

            gradient = context.createRadialGradient(disc.x, disc.y, 0,
                disc.x, disc.y, disc.radius);

            gradient.addColorStop(0.3, disc.innerColor);
            gradient.addColorStop(0.5, disc.middleColor);
            gradient.addColorStop(1.0, disc.outerColor);

            context.beginPath();
            context.arc(disc.x, disc.y, disc.radius, 0, Math.PI * 2, false);

            context.save();

            context.fillStyle = gradient;
            context.strokeStyle = disc.strokeStyle;
            context.fill();
            context.stroke();
            context.restore();
        }
    }

    //计算帧速率
    function calculateFps(now) {
        fps = 1000 / (now - lastTime); // 1s运行了多少帧 ( 1s/一帧所用的时间 )
        lastTime = now;
    }

    // 更新帧速率
    function updateFps() {
        var now = (+new Date);

        calculateFps(now); //计算帧速率

        // 帧绘制时间在 1000-2000之间时，更新帧速率提示信息
        if (now - startTime < 2000) {
            return;
        }
        
        if (now - lastFpsUpdate.time > 1000) {
            lastFpsUpdate.time = now;
            lastFpsUpdate.value = fps;
        }

        if (!paused) {
            context.fillStyle = 'cornflowerblue';
            context.fillText(lastFpsUpdate.value.toFixed() + ' fps', 50, 48);
        }
    }

    // 绘制动画
    function animate(time) {
        if (time === undefined) {
            time = +new Date;
        }

        if (!paused) {
            eraseBackground(); // 擦除canvas
            drawBackground(); // 绘制网格
            // 是否基于时间绘制
            if (timeBasedMotion) {
                updateTimeBased(time);
            }
            else {
                update();
            }
            draw();
        }

        updateFps(); //更新帧速率
    }

    // 播放按钮事件
    animateButton.addEventListener('click', function (e) {
        paused = paused ? false : true;
        if (paused) {
            animateButton.value = 'Animate';
        }
        else {
            animateButton.value = 'Pause';
        }
    });

    // 基于时间控件事件
    timeBasedMotionCheckbox.addEventListener('click', function (e) {
        if (timeBasedMotionCheckbox.checked) {
            timeBasedMotion = true;
            for (var i = 0; i < discs.length; ++i) {
                discs[i].velocityX *= 50;
                discs[i].velocityY *= 50;
            }
        }
        else {
            timeBasedMotion = false;
            for (var i = 0; i < discs.length; ++i) {
                discs[i].velocityX /= 50;
                discs[i].velocityY /= 50;
            }
        }
    });

    context.font = '36px Helvetica';
    drawBackground();
    startTime = +new Date;
    setInterval(animate, 1000 / 60);
}();