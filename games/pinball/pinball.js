// 游戏引擎
var game = new Game('pinball', 'gameCanvas'),
    applyGravityAndFriction = false, //应用重力和摩擦力

    // 再来一次
    TRY_AGAIN_X = 255,
    TRY_AGAIN_Y = 865,
    TRY_AGAIN_RADIUS = 35,
    showTryAgain = false, //如果showTryAgain为true ，那么startAnimate方法会调用brieflyShowAgainImage方法

    // 显示高分
    showingHighScores = true,

    // Flippers 挡板...................................................

    LEFT_FLIPPER = 1,
    RIGHT_FLIPPER = 2,

    // 枢轴
    LEFT_FLIPPER_PIVOT_X = 143,
    LEFT_FLIPPER_PIVOT_Y = 774,

    LEFT_FLIPPER_PIVOT_OFFSET_X = 28,
    LEFT_FLIPPER_PIVOT_OFFSET_Y = 29,

    FLIPPER_RISE_DURATION = 25, //升起时间
    FLIPPER_FALL_DURATION = 175, //降落时间

    MAX_FLIPPER_ANGLE = Math.PI / 4, //挡板旋转最大角度 90°

    LEFT_FLIPPER_STRIKE_ZONE_LEFT = 175,
    LEFT_FLIPPER_STRIKE_ZONE_RIGHT = 260,

    FLIPPER_BOTTOM = 870,

    leftFlipperRiseTimer =
    new AnimationTimer(FLIPPER_RISE_DURATION,
        AnimationTimer.makeEaseOut(3)),
    leftFlipperFallTimer =
    new AnimationTimer(FLIPPER_FALL_DURATION,
        AnimationTimer.makeEaseIn(3)),

    rightFlipperRiseTimer =
    new AnimationTimer(FLIPPER_RISE_DURATION,
        AnimationTimer.makeEaseOut(3)),
    rightFlipperFallTimer =
    new AnimationTimer(FLIPPER_FALL_DURATION,
        AnimationTimer.makeEaseIn(3)),

    leftFlipperAngle = 0,
    rightFlipperAngle = 0,

    // Actuator 弹簧/触发器 ...................................................

    ACTUATOR_LEFT = 468,
    ACTUATOR_TOP = 839,
    ACTUATOR_PLATFORM_WIDTH = 45,
    ACTUATOR_PLATFORM_HEIGHT = 10,

    // 该游戏用到两个精灵：弹珠以及弹珠发射器
    actuatorSprite = new Sprite('actuator',
        new ImagePainter('images/actuator-0.png')),

    // Ball 小球.......................................................

    BALL_LAUNCH_LEFT = ACTUATOR_LEFT + 3, //小球在发射台的位置
    BALL_LAUNCH_TOP = ACTUATOR_TOP - 30,
    LAUNCH_VELOCITY_Y = 200, //发射速度
    MAX_BALL_VELOCITY = 400, //小球最大速度
    MIN_BALL_VELOCITY = 3, //小球最小速度
    MIN_BALL_VELOCITY_OFF_FLIPPERS = 75, //掉落挡板之后小球最小速度
    GAME_HEIGHT_IN_METERS = 2, //实际游戏高度为2米
    GRAVITY = 9.8; // m/s/s 重力加速度

// 小球位置坐标 
var lastBallPosition = new Point(),

    ballOutOfPlay = false,

    //恢复到准备发射状态
    prepareForLaunch = function () {
        ballSprite.left = BALL_LAUNCH_LEFT;
        ballSprite.top = BALL_LAUNCH_TOP;

        ballSprite.velocityX = 0;
        ballSprite.velocityY = 0;

        applyGravityAndFriction = false;
        // 调整右侧边界左下角x坐标为初始坐标
        adjustRightBoundaryAfterLostBall();

        launching = true;
    },

    //如果弹珠处于死球状态，briefly-TryAnimate方法会显示一副含有try again字样的图像，提示玩家用下一颗弹珠再玩一次
    // 显示 “再来一次” 图片
    brieflyShowTryAgainImage = function (milliseconds) {
        showTryAgain = true;

        setTimeout(function (e) {
            showTryAgain = false;
        }, 2000);
    },

    // 应用重力和摩擦力,表现摩擦力所带来的效果，每过一秒钟，就将弹珠的速度设为原来的50%
    applyFrictionAndGravity = function (time) {
        // time 一帧所用的时间
        var lastElapsedTime = time / 1000, //秒
            metersPerSecond = GRAVITY * lastElapsedTime * 0.1;

        if (Math.abs(ballSprite.velocityX) > MIN_BALL_VELOCITY) {
            ballSprite.velocityX *= Math.pow(0.5, lastElapsedTime); //x轴速度降低
        }

        if (Math.abs(ballSprite.velocityY) > MIN_BALL_VELOCITY) {
            ballSprite.velocityY *= Math.pow(0.5, lastElapsedTime); //y轴速度降低
        }

        ballSprite.velocityY += metersPerSecond *
            parseFloat(game.context.canvas.height / GAME_HEIGHT_IN_METERS);
    },

    // 移动小球
    ballMover = {
        execute: function (sprite, context, time) {
            if (!game.paused && !loading) {
                lastBallPosition.x = sprite.left;
                lastBallPosition.y = sprite.top;

                if (!launching && sprite.left < ACTUATOR_LEFT &&
                    (sprite.top > FLIPPER_BOTTOM || sprite.top < 0)) {
                    /**如果弹珠处于死球状态，那么ballMover对象就将ballOutOfPlay设置为true，
                     * 这样的话，游戏引擎下一次调用startAnimate方法时，就会把弹珠重新放到发射台上，
                     * ballMover并不直接根据重力、摩擦力去修正弹珠的移动速度，而是将这项任务留给applyFrictionAndGravity()方法来完成 */
                    ballOutOfPlay = true;
                }

                sprite.left += game.pixelsPerFrame(time, sprite.velocityX);
                sprite.top += game.pixelsPerFrame(time, sprite.velocityY);
            }
        },
    },

    // 小球精灵
    ballSprite = new Sprite('ball',
        new ImagePainter('images/ball.png'), [ballMover]),

    ballShape = new SpriteShape(ballSprite, ballSprite.width, ballSprite.height),

    // Extra balls 其余小球................................................

    EXTRA_BALLS_RIGHT = 430,
    EXTRA_BALL_WIDTH = 36,
    EXTRA_BALLS_BOTTOM = game.context.canvas.height - 55,

    // Launching 发射..................................................

    launching = false,
    launchStep = 1,
    LAUNCH_STEPS = 8,
    launchImages = [], // filled in with images below 发射图片

    // Loading 加载信息....................................................

    loading = false, // not yet, see the end of this file
    loadingToast = document.getElementById('loadingToast'),
    loadingToastTitle = document.getElementById('loadingToastTitle'),
    loadMessage = document.getElementById('loadMessage'),
    progressDiv = document.getElementById('progressDiv'),
    progressbar = new COREHTML5.Progressbar(300, 23, 'rgba(0,0,0,0.5)', 100, 130, 250),

    // Score 得分......................................................

    scoreToast = document.getElementById('scoreToast'),
    scoreReadout = document.getElementById('score'),
    score = 0,
    lastScore = 0,
    lastScoreUpdate = undefined,//分数的最后更新时间

    // High Score 高分.................................................

    HIGH_SCORES_DISPLAYED = 10,

    highScoreToast = document.getElementById('highScoreToast'),
    highScoreParagraph = document.getElementById('highScoreParagraph'),
    highScoreList = document.getElementById('highScoreList'),
    previousHighScoresTitle = document.getElementById('previousHighScoresTitle'),
    nameInput = document.getElementById('nameInput'),
    addMyScoreButton = document.getElementById('addMyScoreButton'),
    newGameButton = document.getElementById('newGameButton'),
    newGameFromHighScoresButton =
    document.getElementById('newGameFromHighScoresButton'),
    clearHighScoresCheckbox = document.getElementById('clearHighScoresCheckbox'),

    // Lives 生命......................................................

    livesLeft = 3, //生命数量
    life = 100, //生命值

    // Paused 暂停弹框.....................................................

    pausedToast = document.getElementById('pausedToast'),

    // Game Over 游戏结束弹框..................................................

    gameOverToast = document.getElementById('gameOverToast'),
    gameOver = false,

    // Collision Detection 碰撞检测........................................

    shapes = [], //多边形数组

    flipperCollisionDetected = false,

    // 是否仅显示碰撞多边形图像
    showPolygonsOnlyToast = document.getElementById('showPolygonsOnlyToast'),
    showPolygonsOnlyCheckbox = document.getElementById('showPolygonsOnlyCheckbox'),
    showPolygonsOnly = showPolygonsOnlyCheckbox.checked,

    // 圆形
    fiveHundredBumper = new Circle(256, 187, 40), //500分碰撞圆形
    oneHundredBumperRight = new Circle(395, 328, 40), //100分右侧碰撞圆形
    oneHundredBumperLeft = new Circle(116, 328, 40), //100分左侧碰撞圆形
    fiftyBumper = new Circle(255, 474, 40), //50分碰撞圆形

    // 上方500分左右三角
    fiveXBumperLeft = new Polygon(),
    fiveXBumperRight = new Polygon(),
    // 中间200分左右三角
    twoXBumperLeft = new Polygon(),
    twoXBumperRight = new Polygon(),
    // 下方100分左右三角
    oneXBumperLeft = new Polygon(),
    oneXBumperRight = new Polygon(),

    // 上方四个小矩形
    upperLeftBarLeft = new Polygon(),
    upperLeftBarRight = new Polygon(),
    upperRightBarLeft = new Polygon(),
    upperRightBarRight = new Polygon(),

    // 中间四个小矩形
    lowerLeftBarLeft = new Polygon(),
    lowerLeftBarRight = new Polygon(),
    lowerRightBarLeft = new Polygon(),
    lowerRightBarRight = new Polygon(),

    // 弾板
    leftFlipperShape = new Polygon(),
    leftFlipperBaselineShape = new Polygon(),
    rightFlipperShape = new Polygon(),
    rightFlipperBaselineShape = new Polygon(),

    //发射器多边形
    actuatorPlatformShape = new Polygon(),

    // 左右边界
    leftBoundary = new Polygon(),
    rightBoundary = new Polygon();

// Pause and Auto-pause.......................................
//切换游戏的暂停状态
togglePaused = function () {
    game.togglePaused();
    pausedToast.style.display = game.paused ? 'inline' : 'none';
};

pausedToast.onclick = function (e) {
    pausedToast.style.display = 'none';
    togglePaused();
};

window.onblur = function windowOnBlur() {
    if (!launching && !loading && !gameOver && !game.paused) {
        game.togglePaused();
        pausedToast.style.display = game.paused ? 'inline' : 'none';
    }
};

window.onfocus = function windowOnFocus() {
    if (game.paused) {
        game.togglePaused();
        pausedToast.style.display = game.paused ? 'inline' : 'none';
    }
};

// New game ..................................................

newGameButton.onclick = function (e) {
    gameOverToast.style.display = 'none';
    startNewGame();
};

function startNewGame() {
    showPolygonsOnlyToast.style.display = 'block';
    highScoreParagraph.style.display = 'none';
    gameOver = false;
    livesLeft = 3;
    score = 0;
    showingHighScores = false;
    loading = false;
    actuatorSprite.visible = true;
    ballSprite.visible = true;
};

// High Scores 高分榜................................................

// Change game display to show high scores when
// player bests the high score.

showHighScores = function () {
    highScoreParagraph.style.display = 'inline';
    highScoreParagraph.innerText = score;
    highScoreToast.style.display = 'inline';
    updateHighScoreList();
};

// The game shows the list of high scores in
// an ordered list. This method creates that
// list element, and populates it with the
// current high scores.

updateHighScoreList = function () {
    var el,
        highScores = game.getHighScores(),
        length = highScores.length,
        highScore,
        listParent = highScoreList.parentNode;

    listParent.removeChild(highScoreList);
    highScoreList = document.createElement('ol');
    highScoreList.id = 'highScoreList'; // So CSS takes effect
    listParent.appendChild(highScoreList);

    if (length > 0) {
        previousHighScoresTitle.style.display = 'block';

        length = length > 10 ? 10 : length;

        for (var i = 0; i < length; ++i) {

            highScore = highScores[i];
            el = document.createElement('li');
            el.innerText = highScore.score +
                ' by ' + highScore.name;
            highScoreList.appendChild(el);
        }
    } else {
        previousHighScoresTitle.style.display = 'none';
    }
}

// The browser invokes this method when the user clicks on the
// Add My Score button.

addMyScoreButton.onclick = function (e) {
    game.setHighScore({
        name: nameInput.value,
        score: lastScore
    });
    updateHighScoreList();
    addMyScoreButton.disabled = 'true';
    nameInput.value = '';
};


// The browser invokes this method when the user clicks on the
// new game button.

newGameFromHighScoresButton.onclick = function (e) {
    highScoreToast.style.display = 'none';
    startNewGame();
};

// The Add My Score button is only enabled when there
// is something in the nameInput field.

nameInput.onkeyup = function (e) {
    if (nameInput.value.length > 0) {
        addMyScoreButton.disabled = false;
    } else {
        addMyScoreButton.disabled = true;
    }
};


var bumperLit = undefined;
var interval = undefined;

// Score Display..............................................
// 更新分数
updateScore = function (shape) {
    if (shape && !loading && game.lastScoreUpdate !== undefined) {
        //if (game.gameTime - game.lastScoreUpdate > 500) {
        if (shape === fiveHundredBumper) score += 500;
        else if (shape === oneHundredBumperLeft) score += 100;
        else if (shape === oneHundredBumperRight) score += 100;
        else if (shape === fiftyBumper) score += 50;

        scoreToast.style.display = 'inline';
        scoreToast.innerHTML = score.toFixed(0);
        game.lastScoreUpdate = game.gameTime;
        //}
    } else {
        game.lastScoreUpdate = game.gameTime;
    }
};

// Collision Detection 碰撞检测........................................
// 绘制碰撞多边形
function drawCollisionShapes() {
    var centroid;

    shapes.forEach(function (shape) {
        shape.stroke(game.context);
        game.context.beginPath();
        // 绘制中心点
        centroid = shape.centroid();
        game.context.arc(centroid.x, centroid.y, 1.5, 0, Math.PI * 2, false);
        game.context.stroke();
    });
}

function clampBallVelocity() {
    if (ballSprite.velocityX > MAX_BALL_VELOCITY)
        ballSprite.velocityX = MAX_BALL_VELOCITY;
    else if (ballSprite.velocityX < -MAX_BALL_VELOCITY)
        ballSprite.velocityX = -MAX_BALL_VELOCITY;

    if (ballSprite.velocityY > MAX_BALL_VELOCITY)
        ballSprite.velocityY = MAX_BALL_VELOCITY;
    else if (ballSprite.velocityY < -MAX_BALL_VELOCITY)
        ballSprite.velocityY = -MAX_BALL_VELOCITY;
};

// 使用最小平移向量将弹珠与碰撞物体分开
function separate(mtv) {
    var dx, dy, velocityMagnitude, point, theta = 0,
        velocityVector = new Vector(new Point(ballSprite.velocityX, ballSprite.velocityY)),//速度向量
        velocityUnitVector = velocityVector.normalize();// 速度单位向量

    // 如果投影轴的x坐标为0 
    if (mtv.axis.x === 0) {
        theta = Math.PI / 2;
    } else {
        // 获取投影轴夹角
        theta = Math.atan(mtv.axis.y / mtv.axis.x);
    }

    // 根据重叠长度算出最小移动距离dx、dy
    dy = mtv.overlap * Math.sin(theta);
    dx = mtv.overlap * Math.cos(theta);

    // mtv的方向就是小球需要反射的方向，需要确保dx、dy跟mtv坐标轴的x、y方向一致，即正负号一致
    if (mtv.axis.x < 0 && dx > 0 || mtv.axis.x > 0 && dx < 0) dx = -dx; // account for negative angle
    if (mtv.axis.y < 0 && dy > 0 || mtv.axis.y > 0 && dy < 0) dy = -dy;

    ballSprite.left += dx;
    ballSprite.top += dy;
}
/**决定到底依据哪一条向量来反射弹珠的速度向量，该方法先创建一条向量，它从弹珠的中心出发，指向与之相撞的另一个物体的中心，
 * 然后，此方法会求出这个向量与最小平移向量之间的点积，
 * 如果点积大于0，则说明两个向量之间的夹角为锐角，这也就意味着二者大致位于同一个方向，
我们要让弹珠远离碰撞物体的中心，所以，如果点积大于0，则说明我们就要调转最小平移向量的方向，这样弹珠才能远离与之相撞的物体 */
function checkMTVAxisDirection(mtv, shape) {
    var centroid1, centroid2, centroidVector, centroidUnitVector, flipOrNot;
    centroid1 = new Vector(ballShape.centroid());//获取小球的中心点
    centroid2 = new Vector(shape.centroid()),//获取多边形shape的中心点
        centroidVector = centroid2.subtract(centroid1),//从小球指向多边形的向量
        centroidUnitVector = (new Vector(centroidVector)).normalize();//获取向量的单位向量

    // 如果没有碰撞，则返回
    if (mtv.axis === undefined)
        return;

    // 中心点连线点乘mtv，cos(θ)在90°角内为正值，如果乘积为正数，则说明mtv的方向是从小球指向碰撞物的，反弹则需要取反向向量
    if (centroidUnitVector.dotProduct(mtv.axis) > 0) {
        mtv.axis.x = -mtv.axis.x;
        mtv.axis.y = -mtv.axis.y;
    }
};

/** 弹跳
 * 根据弹珠的移动速度创建一条表示速度的方向向量，它还要创建一条与最小平移向量向垂直的向量。
 * 最终根据这个垂直向量算出入射的单位向量所对应的反射向量，然而这样的垂直向量却又两条，所以游戏必须决定到底依据哪一条来计算反射向量,
 * checkMTVAxisDirection方法负责决定到底依据哪一条向量来反射弹珠的速度向量,
 * separate使用最小平移向量将弹珠与碰撞物体分开，
 * 然后bounce方法将设定弹珠被弹回之后的速度，然而在设定弹珠速度时，它还需要对两种情况做出调整。
 * 首先，如果弹珠与弾板相撞时的移动速度很低，那么该方法就要将弹珠的速度调高到预先设定好的某个最小值。
 * 这样做是为了确保弾板总能把弹珠打到一定距离之外，避免弹珠因为反弹速度过低而在弾板上反复跳跃的问题，
 * 最后，该方法要将弹珠的速度限定在某个最大值之内，否则，过高的移动速度可能会使玩家根本看不清弹珠，而且还会导致碰撞检测方法反生漏判
 */
function bounce(mtv, shape, bounceCoefficient) {
    var velocityVector = new Vector(new Point(ballSprite.velocityX, ballSprite.velocityY)),
        velocityUnitVector = velocityVector.normalize(),//速度向量的单位向量
        velocityVectorMagnitude = velocityVector.getMagnitude(),//获取速度向量的长度
        reflectAxis, point;

    // 检测mtv方向，并重置mtv方向
    checkMTVAxisDirection(mtv, shape);

    // 判断小球是否正在运动
    if (!loading && !game.paused) {

        if (mtv.axis !== undefined) {
            // 获取mtv的投影轴axis的垂直向量，即边缘法向量
            reflectAxis = mtv.axis.perpendicular();
        }

        // 将小球移动根据mtv计算得来的长度的距离
        separate(mtv);

        // (边缘向量 - 速度向量) = 反射向量
        // 边缘向量 = 速度向量投影长度 * 2 * 边缘向量单位法向量（reflectAxis/|reflectAxis|）
        point = velocityUnitVector.reflect(reflectAxis);

        // 速度向量的长度，如果弹珠与弾板相撞时的移动速度很低，那么该方法就要将弹珠的速度调高到预先设定好的某个最小值
        if (shape === leftFlipperShape || shape === rightFlipperShape) {
            if (velocityVectorMagnitude < MIN_BALL_VELOCITY_OFF_FLIPPERS)
                velocityVectorMagnitude = MIN_BALL_VELOCITY_OFF_FLIPPERS;
        }

        // 反射向量 * 速度长度 * 弹跳系数4.5
        ballSprite.velocityX = point.x * velocityVectorMagnitude * bounceCoefficient;
        ballSprite.velocityY = point.y * velocityVectorMagnitude * bounceCoefficient;

        // 限制小球速度的最大值和最小值
        clampBallVelocity();
    }
}

// 检测返回的mtv是否碰撞，如果未碰撞{axis:undefined,overlap:0}，则返回false，碰撞返回true
function collisionDetected(mtv) {
    return mtv.axis !== undefined && mtv.overlap !== 0;
};

/**SAT用于移动速度缓慢且面积相对大一些的多边形，用以检测小球和弾板之外的物体的碰撞,判断弹珠与正在移动的弾板之间的碰撞时，会辅以光线投射法
 * detectCollisions 使用光线投射法检测小球与弾板的碰撞，先创建两条向量，
 * 其中一条由原点指向弾板表面的第一个点，另一条由原点指向弾板表面的第二个点，
 * 用第二个向量减去第一个向量，得出了一条沿着弾板边缘而延伸的向量，该方法还创建了两条线段，
 * 其中一条将弹珠再上一帧的位置与其当前位置连接起来，而另外一条则紧贴着弾板的边缘 */
function detectCollisions() {
    var mtv, shape, displacement, position, lastPosition;

    // 判断小球是否是正在运动中
    if (!launching && !loading && !game.paused) {
        ballShape.x = ballSprite.left;
        ballShape.y = ballSprite.top;
        ballShape.points = [];
        // 将小球当做正方形，设置小球的四个边
        ballShape.setPolygonPoints();

        // 小球当前位置
        position = new Vector(new Point(ballSprite.left, ballSprite.top));
        // 小球上一帧位置
        lastPosition = new Vector(new Point(lastBallPosition.x, lastBallPosition.y));
        // 获取一条从上一次的位置指向当前位置的向量
        displacement = position.subtract(lastPosition);

        // 遍历碰撞形状
        for (var i = 0; i < shapes.length; ++i) {
            shape = shapes[i];

            if (shape !== ballShape) {
                // 获取最小碰撞向量{axis:axisWithSmallestOverlap, overlap:minimumOverlap}
                // 如果未碰撞返回{axis:undefined, overlap:0}
                mtv = ballShape.collidesWith(shape, displacement);

                // 检测是否碰撞，如果碰撞
                if (collisionDetected(mtv)) {
                    // 如果碰撞到四个圆，更新分数500/100/50
                    updateScore(shape);

                    setTimeout(function (e) {
                        bumperLit = undefined;
                    }, 100);

                    // 如果碰撞到三角形，播放音乐
                    if (shape === twoXBumperLeft ||
                        shape === twoXBumperRight ||
                        shape === fiveXBumperRight ||
                        shape === fiveXBumperLeft ||
                        shape === fiftyBumper ||
                        shape === oneHundredBumperLeft ||
                        shape === oneHundredBumperRight ||
                        shape === fiveHundredBumper) {
                        game.playSound('bumper');

                        // 根据mtv计算反射速度
                        bounce(mtv, shape, 4.5);

                        bumperLit = shape; //当前碰撞多边形
                        return true;

                    // 如果是挡板，且挡板的旋转角度为0
                    } else if (shape === rightFlipperShape) {
                        if (rightFlipperAngle === 0) {
                            bounce(mtv, shape, 1 + rightFlipperAngle);
                            return true;
                        }
                    } else if (shape === leftFlipperShape) {
                        if (leftFlipperAngle === 0) {
                            bounce(mtv, shape, 1 + leftFlipperAngle);
                            return true;
                        }
                    // 如果是发射器
                    } else if (shape === actuatorPlatformShape) {
                        bounce(mtv, shape, 0.2);
                        return true;

                    // 其它
                    } else {
                        bounce(mtv, shape, 0.96);
                        return true;
                    }
                }
            }
        }

        flipperCollisionDetected = false;

        // 检测挡板碰撞
        detectFlipperCollision(LEFT_FLIPPER);
        detectFlipperCollision(RIGHT_FLIPPER);

        return flipperCollisionDetected;
    }
    return false;
}

// 检测挡板碰撞
function detectFlipperCollision(flipper) {
    var v1, v2, l1, l2, surface, ip, bbox = {},
        riseTimer;

    bbox.top = 725;
    bbox.bottom = 850;

    // 如果是左挡板
    if (flipper === LEFT_FLIPPER) {
        // 左挡板顶点1旋转后的坐标
        v1 = new Vector(leftFlipperBaselineShape.points[0].rotate(
            LEFT_FLIPPER_ROTATION_POINT,
            leftFlipperAngle));

        // 左挡板顶点2旋转后的坐标
        v2 = new Vector(leftFlipperBaselineShape.points[1].rotate(
            LEFT_FLIPPER_ROTATION_POINT,
            leftFlipperAngle));

        bbox.left = 170;
        bbox.right = 265;
        riseTimer = leftFlipperRiseTimer;
    
    // 如果是右挡板
    } else if (flipper === RIGHT_FLIPPER) {
        v1 = new Vector(rightFlipperBaselineShape.points[0].rotate(
            RIGHT_FLIPPER_ROTATION_POINT,
            rightFlipperAngle));

        v2 = new Vector(rightFlipperBaselineShape.points[1].rotate(
            RIGHT_FLIPPER_ROTATION_POINT,
            rightFlipperAngle));

        bbox.left = 245;
        bbox.right = 400;
        riseTimer = rightFlipperRiseTimer;
    }

    if (!flipperCollisionDetected && riseTimer.isRunning() &&
        ballSprite.top + ballSprite.height > bbox.top && ballSprite.left < bbox.right) {

        // 从端点1指向端点2的向量
        surface = v2.subtract(v1);

        // 小球当前位置到上一帧位置的线段
        l1 = new Line(new Point(ballSprite.left, ballSprite.top), lastBallPosition),
            l2 = new Line(new Point(v2.x, v2.y), new Point(v1.x, v1.y)),//从端点1指向端点2的线段
            ip = l1.intersectionPoint(l2);//小球射线和挡板连线的交点

        if (ip.x > bbox.left && ip.x < bbox.right) {
            // surface.perpendicular() 获取surface的垂直法向量，矢量反射速度
            reflectVelocityAroundVector(surface.perpendicular());

            // 计算小球速度
            ballSprite.velocityX = ballSprite.velocityX * 3.5;
            ballSprite.velocityY = ballSprite.velocityY * 3.5;

            // 如果小球y轴速度>0 ，则取反
            if (ballSprite.velocityY > 0)
                ballSprite.velocityY = -ballSprite.velocityY;

            // 如果小球碰撞左挡板，x轴速度>0
            if (flipper === LEFT_FLIPPER && ballSprite.velocityX < 0)
                ballSprite.velocityX = -ballSprite.velocityX;

            // 如果小球碰撞右挡板，x轴速度<0
            else if (flipper === RIGHT_FLIPPER && ballSprite.velocityX > 0)
                ballSprite.velocityX = -ballSprite.velocityX;
        }
    }
}

// 矢量反射速度
function reflectVelocityAroundVector(v) {
    var velocityVector = new Vector(new Point(ballSprite.velocityX, ballSprite.velocityY)),//速度向量
        velocityUnitVector = velocityVector.normalize(),
        velocityVectorMagnitude = velocityVector.getMagnitude(),
        point = velocityUnitVector.reflect(v);

    ballSprite.velocityX = point.x * velocityVectorMagnitude;
    ballSprite.velocityY = point.y * velocityVectorMagnitude;
}

// Game Loop..................................................
// 显示再来一次图片
function showTryAgainImage() {
    game.context.save();
    game.context.arc(TRY_AGAIN_X, TRY_AGAIN_Y, TRY_AGAIN_RADIUS,
        0, Math.PI * 2, false);

    game.context.clip();

    game.context.drawImage(game.getImage('images/tryAgain.png'), 0,
        game.context.canvas.height - 200);
    game.context.restore();
};

// 绘制另外的小球
function drawExtraBall(index) {
    game.context.drawImage(game.getImage('images/ball.png'),
        EXTRA_BALLS_RIGHT - EXTRA_BALL_WIDTH * index,
        EXTRA_BALLS_BOTTOM);
};

// 游戏结束方法
function over() {
    var highScore;
    highScores = game.getHighScores();

    if (highScores.length == 0 || score > highScores[0].score) {
        showingHighScores = true;
        actuatorSprite.visible = false;
        ballSprite.visible = false;
        showHighScores();
    } else {
        gameOverToast.style.display = 'inline';
    }

    gameOver = true;
    lastScore = score;
    score = 0;
};

// 500、100分碰撞圆形位置
var FIVE_HUNDRED_BUMPER_LEFT = 216,
    FIVE_HUNDRED_BUMPER_RIGHT = 147,
    ONE_HUNDRED_BUMPER_LEFT = 77,
    ONE_HUNDRED_BUMPER_RIGHT = 288;

// 小球碰撞圆形时，绘制激活样式的图像 
function drawLitBumper() {
    // 如果当前碰撞多边形是 fiveHundredBumper
    if (bumperLit === fiveHundredBumper) {
        game.context.drawImage(game.getImage('images/fiveHundredBumperBright.png'),
            FIVE_HUNDRED_BUMPER_LEFT,
            FIVE_HUNDRED_BUMPER_RIGHT);
    } else if (bumperLit === oneHundredBumperLeft) {
        game.context.drawImage(game.getImage('images/oneHundredBumperBright.png'),
            ONE_HUNDRED_BUMPER_LEFT,
            ONE_HUNDRED_BUMPER_RIGHT);
    } else if (bumperLit === oneHundredBumperRight) {
        game.context.drawImage(game.getImage('images/oneHundredBumperBright.png'), 355, 288);
    } else if (bumperLit === fiftyBumper) {
        game.context.drawImage(game.getImage('images/fiftyBumperBright.png'), 215, 434);
    } else if (bumperLit === oneXBumperLeft) {
        game.context.drawImage(game.getImage('images/oneXBumperLeftBright.png'), 71, 776);
    } else if (bumperLit === oneXBumperRight) {
        game.context.drawImage(game.getImage('images/oneXBumperRightBright.png'), 305, 775);
    } else if (bumperLit === twoXBumperLeft) {
        game.context.drawImage(game.getImage('images/twoXBumperLeftBright.png'), 93, 632);
    } else if (bumperLit === twoXBumperRight) {
        game.context.drawImage(game.getImage('images/twoXBumperRightBright.png'), 333, 631);
    } else if (bumperLit === fiveXBumperLeft) {
        game.context.drawImage(game.getImage('images/fiveXBumperLeftBright.png'), 95, 450);
    } else if (bumperLit === fiveXBumperRight) {
        game.context.drawImage(game.getImage('images/fiveXBumperRightBright.png'), 350, 450);
    }
}

// 第一步
/** 调整左右两个弾板的碰撞对变形（如果它们正在运动的话）并且调用detectCollisions方法来检测并应对碰撞
    如果没有碰撞发生，并且当前状况应该考虑重力及摩擦因素的话（正在发射弹珠时是不用考虑这个因素的），
    那么该方法就会根据这两个力修正弹珠的移动速度 */
game.startAnimate = function (time) {
    var collisionOccurred;

    // 如果是正在加载、游戏暂停、准备发射状态，则直接返回
    if (loading || game.paused || launching)
        return;

    // 如果弹珠处于死球状态
    if (ballOutOfPlay) {
        ballOutOfPlay = false;
        prepareForLaunch(); //恢复到准备发射状态
        brieflyShowTryAgainImage(2000);// 显示 “再来一次” 图片
        livesLeft--;

        if (!gameOver && livesLeft === 0) {
            over();// 游戏结束，显示高分榜
        }
        return;
    }

    // 根据旋转角度调整挡板坐标
    adjustRightFlipperCollisionPolygon();
    adjustLeftFlipperCollisionPolygon();

    // 使用光线投射法检测小球与弾板的碰撞
    collisionOccurred = detectCollisions();

    // 应用摩擦力
    if (!collisionOccurred && applyGravityAndFriction) {
        applyFrictionAndGravity(parseFloat(time - game.lastTime)); // modifies ball velocity
    }
};

// 第二步
// 更新并绘制左右两个弾板
game.paintUnderSprites = function () {
    if (loading)
        return;

    //更新挡板的旋转角度
    updateLeftFlipper();
    updateRightFlipper();

    // 如果只显示碰撞多边形
    if (showPolygonsOnly) {
        // 绘制所有多边形
        drawCollisionShapes();
    } else {
        if (!showingHighScores) {
            // 绘制背景
            game.context.drawImage(game.getImage('images/background.png'), 0, 0);

            // 小球碰撞多边形时，绘制激活样式的图像 
            drawLitBumper();

            if (showTryAgain) {
                // 显示再来一次图片
                showTryAgainImage();
            }

            // 绘制挡板
            paintLeftFlipper();
            paintRightFlipper();

            // 根据生命数livesLeft，绘制额外的小球
            for (var i = 0; i < livesLeft - 1; ++i) {
                drawExtraBall(i);
            }
        }
    }
};

// 创建圆形对象500分、100分、50分
var fiveHundredBumper = new Circle(256, 187, 40);
var oneHundredBumperRight = new Circle(395, 328, 40);
var oneHundredBumperLeft = new Circle(116, 328, 40);
var fiftyBumper = new Circle(255, 474, 40);

//rightFlipperImage.src = 'images/rightFlipper.png';
//leftFlipperImage.src = 'images/leftFlipper.png';
//fiveHundredBumperBrightImage.src = 'images/fiveHundredBumper-bright.png';
//oneHundredBumperBrightImage.src = 'images/oneHundredBumper-bright.png';
//fiftyBumperBrightImage.src = 'images/fiftyBumper-bright.png';
//oneXBumperLeftBrightImage.src = 'images/oneXBumperLeft-bright.png';
//oneXBumperRightBrightImage.src = 'images/oneXBumperRight-bright.png';
//twoXBumperRightBrightImage.src = 'images/twoXBumperRight-bright.png';
//twoXBumperLeftBrightImage.src = 'images/twoXBumperLeft-bright.png';
//fiveXBumperRightBrightImage.src = 'images/fiveXBumperRight-bright.png';
//fiveXBumperLeftBrightImage.src = 'images/fiveXBumperLeft-bright.png';

// 挡板枢轴中心点
var LEFT_FLIPPER_ROTATION_POINT = new Point(145, 775),
    RIGHT_FLIPPER_ROTATION_POINT = new Point(370, 775);

// 根据角度调整挡板坐标
function adjustLeftFlipperCollisionPolygon() {
    if (leftFlipperRiseTimer.isRunning() || leftFlipperFallTimer.isRunning()) {
        for (var i = 0; i < leftFlipperShape.points.length; ++i) {
            var rp = leftFlipperBaselineShape.points[i].rotate(
                LEFT_FLIPPER_ROTATION_POINT,
                leftFlipperAngle);

            leftFlipperShape.points[i].x = rp.x;
            leftFlipperShape.points[i].y = rp.y;
        }
    }
}

// 根据角度调整挡板坐标
function adjustRightFlipperCollisionPolygon() {
    // 根据animatetimer判断发射器是否正在在上升或者下降 
    if (rightFlipperRiseTimer.isRunning() || rightFlipperFallTimer.isRunning()) {
        // 遍历发射器碰撞多边形端点数组
        for (var i = 0; i < rightFlipperShape.points.length; ++i) {
            // RIGHT_FLIPPER_ROTATION_POINT 挡板枢轴中心点
            // 将坐标点沿着枢轴旋转rightFlipperAngle角度
            var rp = rightFlipperBaselineShape.points[i].rotate(
                RIGHT_FLIPPER_ROTATION_POINT, -rightFlipperAngle);
            
            // 设置旋转后的坐标
            rightFlipperShape.points[i].x = rp.x;
            rightFlipperShape.points[i].y = rp.y;
        }
    }
}

// 重置挡板多边形位置
function resetLeftFlipperCollisionPolygon() {
    for (var i = 0; i < leftFlipperShape.points.length; ++i) {
        var point = leftFlipperBaselineShape.points[i];

        leftFlipperShape.points[i].x = leftFlipperBaselineShape.points[i].x;
        leftFlipperShape.points[i].y = leftFlipperBaselineShape.points[i].y;
    }
}

function resetRightFlipperCollisionPolygon() {
    for (var i = 0; i < rightFlipperShape.points.length; ++i) {
        var point = rightFlipperBaselineShape.points[i];

        rightFlipperShape.points[i].x = rightFlipperBaselineShape.points[i].x;
        rightFlipperShape.points[i].y = rightFlipperBaselineShape.points[i].y;
    }
}

//调整左弾板的角度
function updateLeftFlipper() {
    if (leftFlipperRiseTimer.isRunning()) { // Flipper is rising
        if (leftFlipperRiseTimer.isOver()) { // Finished rising
            leftFlipperRiseTimer.stop(); // Stop rise timer
            leftFlipperAngle = MAX_FLIPPER_ANGLE; // Set flipper angle
            leftFlipperFallTimer.start(); // Start falling
        } else { // Flipper is still rising
            leftFlipperAngle =
                MAX_FLIPPER_ANGLE / FLIPPER_RISE_DURATION *
                leftFlipperRiseTimer.getElapsedTime();
        }
    } else if (leftFlipperFallTimer.isRunning()) { // Left flipper is falling
        if (leftFlipperFallTimer.isOver()) { // Finished falling
            leftFlipperFallTimer.stop(); // Stop fall timer
            leftFlipperAngle = 0; // Set flipper angle
            resetLeftFlipperCollisionPolygon(); // Reset collision polygon
        } else { // Flipper is still falling
            leftFlipperAngle = MAX_FLIPPER_ANGLE -
                MAX_FLIPPER_ANGLE / FLIPPER_FALL_DURATION *
                leftFlipperFallTimer.getElapsedTime();
        }
    }
}
// 绘制左弾板
function paintLeftFlipper() {
    if (leftFlipperRiseTimer.isRunning() || leftFlipperFallTimer.isRunning()) {
        game.context.save();
        game.context.translate(LEFT_FLIPPER_PIVOT_X, LEFT_FLIPPER_PIVOT_Y);
        game.context.rotate(-leftFlipperAngle);
        game.context.drawImage(game.getImage('images/leftFlipper.png'), -LEFT_FLIPPER_PIVOT_OFFSET_X, -LEFT_FLIPPER_PIVOT_OFFSET_Y);
        game.context.restore();
    } else {
        game.context.drawImage(game.getImage('images/leftFlipper.png'),
            LEFT_FLIPPER_PIVOT_X - LEFT_FLIPPER_PIVOT_OFFSET_X,
            LEFT_FLIPPER_PIVOT_Y - LEFT_FLIPPER_PIVOT_OFFSET_Y);
    }
}
// 绘制右弾板
function paintRightFlipper() {
    if (rightFlipperRiseTimer.isRunning() || rightFlipperFallTimer.isRunning()) {
        game.context.save();
        game.context.translate(370, 776);
        game.context.rotate(rightFlipperAngle);
        game.context.drawImage(game.getImage('images/rightFlipper.png'), -99, -29);
        game.context.restore();
    } else {
        game.context.drawImage(game.getImage('images/rightFlipper.png'), 272, 745);
    }
}

//调整右挡板的角度
function updateRightFlipper() {
    // 如果挡板在上升
    if (rightFlipperRiseTimer.isRunning()) {
        // 上升结束
        if (rightFlipperRiseTimer.isOver()) {
            // 开始下降
            rightFlipperRiseTimer.stop();
            flipperCollisionDetected = false; // reset

            rightFlipperFallTimer.start();
            rightFlipperAngle = MAX_FLIPPER_ANGLE;
        } else {
            // 增加角度
            rightFlipperAngle =
                MAX_FLIPPER_ANGLE / FLIPPER_RISE_DURATION *
                rightFlipperRiseTimer.getElapsedTime();
        }
    } else if (rightFlipperFallTimer.isRunning()) {
        // 如果挡板在下降，角度减去
        rightFlipperAngle = MAX_FLIPPER_ANGLE -
            MAX_FLIPPER_ANGLE / FLIPPER_FALL_DURATION *
            rightFlipperFallTimer.getElapsedTime();

        // 如果下降结束
        if (rightFlipperFallTimer.isOver()) {
            rightFlipperFallTimer.stop();
            rightFlipperAngle = 0;
            // 重置右挡板为初始位置
            resetRightFlipperCollisionPolygon();
        }
    }
}

// 调整发射台坐标位置
function adjustActuatorPlatformShape() {
    var i, point;

    for (i = 0; i < actuatorPlatformShape.points.length; ++i) {
        point = actuatorPlatformShape.points[i];
        // 顶部两个顶点坐标
        if (i < 2 || i === actuatorPlatformShape.points.length - 1)
            point.y = ACTUATOR_TOP + launchStep * 10;
        else
            // 底部两个点的坐标
            point.y = ACTUATOR_TOP + launchStep * 10 + 10;
    }
}

// Key Listeners..............................................

// 按下k键，右侧弾板弹起，同时播放弾板弹起音效
lastKeyListenerTime = 0, // For throttling arrow keys

    game.addKeyListener({
        key: 'k',
        listener: function () {
            if (!launching && !gameOver) {
                rightFlipperRiseTimer.start();
                rightFlipperAngle = 0;
                game.playSound('flipper');
            }
        }
    });

// 按下D键，左侧弾板弹起，同时播放弾板弹起音效
game.addKeyListener({
    key: 'd',
    listener: function () {
        if (!launching && !gameOver) {
            leftFlipperRiseTimer.start();
            leftFlipperAngle = 0;
            game.playSound('flipper');
        }
    }
});

// P键，切换游戏的暂停状态，调用togglePaused()方法
game.addKeyListener({
    key: 'p',
    listener: function () {
        togglePaused();
    }
});

// ↑键，使发射器的弹簧弹起
game.addKeyListener({
    key: 'up arrow',
    listener: function () {
        var now;

        if (!launching || launchStep === 1)
            return;

        now = +new Date();
        // 距离上次按键时间间隔大于 80ms
        if (now - lastKeyListenerTime > 80) { // throttle
            lastKeyListenerTime = now;
            launchStep--;
            actuatorSprite.painter.image = launchImages[launchStep - 1];
            ballSprite.top = BALL_LAUNCH_TOP + (launchStep - 1) * 9;
            // 调整发射台碰撞四边形的位置坐标
            adjustActuatorPlatformShape();
        }
    }
});

// ↓键，压下发射器弹簧
game.addKeyListener({
    key: 'down arrow',
    listener: function () {
        var now;

        if (!launching || launchStep === LAUNCH_STEPS)
            return;

        now = +new Date();
        if (now - lastKeyListenerTime > 80) { // throttle
            lastKeyListenerTime = now;
            launchStep++;
            actuatorSprite.painter.image = launchImages[launchStep - 1];
            ballSprite.top = BALL_LAUNCH_TOP + (launchStep - 1) * 9;
            adjustActuatorPlatformShape();
        }
    }
});

// 调整右侧边界左下角x坐标
function adjustRightBoundaryAfterLostBall() {
    rightBoundary.points[1].x = 508;
}
// 弹珠发射之后调整右侧边界左下角x坐标
function adjustRightBoundaryAfterLaunch() {
    rightBoundary.points[1].x = 460;
}

// 空格键发射弹珠
game.addKeyListener({
    key: 'space',
    listener: function () {
        if (!launching && ballSprite.left === BALL_LAUNCH_LEFT &&
            ballSprite.velocityY === 0) {
            launching = true;
            ballSprite.velocityY = 0;
            applyGravityAndFriction = false;
            launchStep = 1;
        }
        if (launching) {
            // 根据按压，设置小球初始速度
            ballSprite.velocityY = -300 * launchStep;

            // 重置参数，步骤重置为1
            launching = false;
            launchStep = 1;

            // 50ms 之后将发射台位置重置
            setTimeout(function (e) {
                actuatorSprite.painter.image = launchImages[0];
                adjustActuatorPlatformShape();
            }, 50);

            // 2s之后，使用重力和摩擦力
            setTimeout(function (e) {
                applyGravityAndFriction = true;
                // 弹珠发射之后调整右侧边界左下角x坐标
                adjustRightBoundaryAfterLaunch();
            }, 2000);
        }
    }
});

game.addKeyListener({
    key: 'right arrow',
    listener: function () {
        var now = +new Date();
        // 如果按键时间间隔 大于200，则将按键时间重置为当前时间
        if (now - lastKeyListenerTime > 200) { // throttle
            lastKeyListenerTime = now;
        }
    }
});

game.addKeyListener({
    key: 'left arrow',
    listener: function () {
        var now = +new Date();
        // 如果按键时间间隔 大于200，则将按键时间重置为当前时间
        if (now - lastKeyListenerTime > 200) { // throttle
            lastKeyListenerTime = now;
        }
    }
});

// Clear high scores checkbox.................................
// 清空分数复选框
clearHighScoresCheckbox.onclick = function (e) {
    if (clearHighScoresCheckbox.checked) {
        game.clearHighScores();
    }
};


// 游戏开始 *******************************************************************************

// Load game 初始化加载弹框和进度条...............................

loading = true;
var interval,
    percentComplete = 0;

progressDiv.style.display = 'block';
progressDiv.appendChild(progressbar.domElement);

// Start game.................................................

//progressDiv.style.display = 'none';
//loadingToast.style.display = 'none';   

// 初始化小球位置、宽高
ballSprite.top = BALL_LAUNCH_TOP;
ballSprite.left = BALL_LAUNCH_LEFT;
ballSprite.width = 33;
ballSprite.height = ballSprite.width;

// 左边界坐标
leftBoundary.points.push(new Point(45, 235));
leftBoundary.points.push(new Point(45, game.context.canvas.height));
leftBoundary.points.push(new Point(-450, game.context.canvas.height));
leftBoundary.points.push(new Point(-450, 235));
leftBoundary.points.push(new Point(45, 235));

// 右边界坐标
rightBoundary.points.push(new Point(508, 235));
rightBoundary.points.push(new Point(508, game.context.canvas.height));
rightBoundary.points.push(new Point(508 * 2, game.context.canvas.height));
rightBoundary.points.push(new Point(508 * 2, 235))
rightBoundary.points.push(new Point(508, 235));

// 发射器坐标
actuatorPlatformShape.points.push(new Point(ACTUATOR_LEFT - 5, ACTUATOR_TOP));
actuatorPlatformShape.points.push(new Point(ACTUATOR_LEFT - 5 + ACTUATOR_PLATFORM_WIDTH,
    ACTUATOR_TOP));

actuatorPlatformShape.points.push(new Point(ACTUATOR_LEFT - 5 + ACTUATOR_PLATFORM_WIDTH,
    ACTUATOR_TOP + ACTUATOR_PLATFORM_HEIGHT));

actuatorPlatformShape.points.push(new Point(ACTUATOR_LEFT - 5,
    ACTUATOR_TOP + ACTUATOR_PLATFORM_HEIGHT));

actuatorPlatformShape.points.push(new Point(ACTUATOR_LEFT - 5, ACTUATOR_TOP));

// 右弾板坐标
rightFlipperShape.points.push(new Point(365, 745));
rightFlipperShape.points.push(new Point(272, 836));
rightFlipperShape.points.push(new Point(293, 857));
rightFlipperShape.points.push(new Point(398, 781));
rightFlipperShape.points.push(new Point(365, 745));

// 左弾板坐标
leftFlipperShape.points.push(new Point(142, 743));
leftFlipperShape.points.push(new Point(239, 837));
leftFlipperShape.points.push(new Point(218, 855));
leftFlipperShape.points.push(new Point(116, 783));
leftFlipperShape.points.push(new Point(142, 743));

// 右弾板坐标
rightFlipperBaselineShape.points.push(new Point(365, 745));
rightFlipperBaselineShape.points.push(new Point(272, 836));
rightFlipperBaselineShape.points.push(new Point(293, 857));
rightFlipperBaselineShape.points.push(new Point(398, 781));
rightFlipperBaselineShape.points.push(new Point(365, 745));

// 左弾板坐标
leftFlipperBaselineShape.points.push(new Point(142, 743));
leftFlipperBaselineShape.points.push(new Point(239, 837));
leftFlipperBaselineShape.points.push(new Point(218, 855));
leftFlipperBaselineShape.points.push(new Point(116, 783));
leftFlipperBaselineShape.points.push(new Point(142, 743));

// 中间四个小矩形坐标
lowerRightBarLeft.points.push(new Point(294, 525));
lowerRightBarLeft.points.push(new Point(306, 525));
lowerRightBarLeft.points.push(new Point(306, 590));
lowerRightBarLeft.points.push(new Point(294, 590));
lowerRightBarLeft.points.push(new Point(294, 525));

lowerRightBarRight.points.push(new Point(342, 525));
lowerRightBarRight.points.push(new Point(354, 525));
lowerRightBarRight.points.push(new Point(354, 590));
lowerRightBarRight.points.push(new Point(342, 590));
lowerRightBarRight.points.push(new Point(342, 525));

lowerLeftBarLeft.points.push(new Point(156, 525));
lowerLeftBarLeft.points.push(new Point(168, 525));
lowerLeftBarLeft.points.push(new Point(168, 590));
lowerLeftBarLeft.points.push(new Point(156, 590));
lowerLeftBarLeft.points.push(new Point(156, 525));

lowerLeftBarRight.points.push(new Point(204, 525));
lowerLeftBarRight.points.push(new Point(216, 525));
lowerLeftBarRight.points.push(new Point(216, 590));
lowerLeftBarRight.points.push(new Point(204, 590));
lowerLeftBarRight.points.push(new Point(204, 525));

// 上方四个小矩形坐标
upperLeftBarLeft.points.push(new Point(86, 185));
upperLeftBarLeft.points.push(new Point(86, 263));
upperLeftBarLeft.points.push(new Point(98, 263));
upperLeftBarLeft.points.push(new Point(98, 185));
upperLeftBarLeft.points.push(new Point(86, 185));

upperLeftBarRight.points.push(new Point(134, 185));
upperLeftBarRight.points.push(new Point(136, 263));
upperLeftBarRight.points.push(new Point(146, 263));
upperLeftBarRight.points.push(new Point(146, 185));
upperLeftBarRight.points.push(new Point(134, 185));

upperRightBarLeft.points.push(new Point(368, 185));
upperRightBarLeft.points.push(new Point(368, 263));
upperRightBarLeft.points.push(new Point(380, 263));
upperRightBarLeft.points.push(new Point(380, 185));
upperRightBarLeft.points.push(new Point(368, 185));

upperRightBarRight.points.push(new Point(417, 185));
upperRightBarRight.points.push(new Point(417, 263));
upperRightBarRight.points.push(new Point(427, 263));
upperRightBarRight.points.push(new Point(427, 185));
upperRightBarRight.points.push(new Point(417, 185));

// 下方100分左右三角坐标
oneXBumperLeft.points.push(new Point(80, 780));
oneXBumperLeft.points.push(new Point(215, 875));
oneXBumperLeft.points.push(new Point(80, 875));
oneXBumperLeft.points.push(new Point(80, 780));

oneXBumperRight.points.push(new Point(300, 875));
oneXBumperRight.points.push(new Point(435, 775));
oneXBumperRight.points.push(new Point(435, 875));
oneXBumperRight.points.push(new Point(300, 875));

// 中间200分左右三角坐标
twoXBumperLeft.points.push(new Point(98, 635));
twoXBumperLeft.points.push(new Point(180, 715));
twoXBumperLeft.points.push(new Point(98, 715));
twoXBumperLeft.points.push(new Point(98, 635));

twoXBumperRight.points.push(new Point(420, 630));
twoXBumperRight.points.push(new Point(420, 715));
twoXBumperRight.points.push(new Point(330, 715));
twoXBumperRight.points.push(new Point(420, 630));

// 上方500分左右三角坐标
fiveXBumperLeft.points.push(new Point(98, 450));
fiveXBumperLeft.points.push(new Point(163, 450));
fiveXBumperLeft.points.push(new Point(98, 505));
fiveXBumperLeft.points.push(new Point(98, 450));

fiveXBumperRight.points.push(new Point(350, 450));
fiveXBumperRight.points.push(new Point(415, 450));
fiveXBumperRight.points.push(new Point(415, 505));
fiveXBumperRight.points.push(new Point(350, 450));

// 将所有的碰撞多边形存储到shape中
shapes.push(ballShape);
shapes.push(leftBoundary);
shapes.push(rightBoundary);

shapes.push(fiveHundredBumper);
shapes.push(oneHundredBumperLeft);
shapes.push(oneHundredBumperRight);
shapes.push(fiftyBumper);
shapes.push(fiveXBumperLeft);
shapes.push(fiveXBumperRight);
shapes.push(twoXBumperLeft);
shapes.push(twoXBumperRight);
shapes.push(upperLeftBarLeft);
shapes.push(upperLeftBarRight);
shapes.push(upperRightBarLeft);
shapes.push(upperRightBarRight);
//shapes.push(oneXBumperLeft);
//shapes.push(oneXBumperRight);
shapes.push(lowerLeftBarLeft);
shapes.push(lowerLeftBarRight);
shapes.push(lowerRightBarLeft);
shapes.push(lowerRightBarRight);

shapes.push(rightFlipperShape);
shapes.push(leftFlipperShape);

shapes.push(actuatorPlatformShape);

// 初始化小球的速度
ballSprite.velocityX = 0;
ballSprite.velocityY = 0;
ballSprite.visible = false;

// 初始化发射器的速度、宽高
actuatorSprite.velocityX = 0;
actuatorSprite.velocityY = 0;
actuatorSprite.width = 60;
actuatorSprite.height = 100;
actuatorSprite.visible = true;


// 将小球、发射器精灵存储到game中
game.addSprite(actuatorSprite);
game.addSprite(ballSprite);


// 转换坐标为canvas坐标
function windowToCanvas(e) {
    var x = e.x || e.clientX,
        y = e.y || e.clientY,
        bbox = game.context.canvas.getBoundingClientRect();

    return {
        x: x - bbox.left * (game.context.canvas.width / bbox.width),
        y: y - bbox.top * (game.context.canvas.height / bbox.height)
    };
}

// 绘制横线
function drawHorizontalLine(y) {
    game.context.moveTo(0, y + 0.5);
    game.context.lineTo(game.context.canvas.width, y + 0.5);
    game.context.stroke();
}

// 绘制纵线
function drawVerticalLine(x) {
    game.context.moveTo(x + 0.5, 0);
    game.context.lineTo(x + 0.5, game.context.canvas.height);
    game.context.stroke();
}

// 点击是否只显示‘多边形’复选框
showPolygonsOnlyCheckbox.onclick = function (e) {
    showPolygonsOnly = showPolygonsOnlyCheckbox.checked;
    if (showPolygonsOnly) {
        ballSprite.visible = false;
        actuatorSprite.visible = false;
    } else {
        ballSprite.visible = true;
        actuatorSprite.visible = true;
    }
};

// 发射器初始坐标
actuatorSprite.top = ACTUATOR_TOP,
    actuatorSprite.left = ACTUATOR_LEFT,
    actuatorSprite.visible = false;

// 创建三角形, 弹珠台原顶视为多个三角形
function createDomePolygons(centerX, centerY, radius, sides) {
    var polygon,
        polygons = [],
        startTheta = 0,
        endTheta,
        midPointTheta,
        thetaDelta = Math.PI / sides,// 180/15
        midPointRadius = radius * 1.5; //midPointRadius 计算出每个三角形距离原顶表面最远的那个顶点

    for (var i = 0; i < sides; ++i) {
        polygon = new Polygon();

        endTheta = startTheta + thetaDelta;
        midPointTheta = startTheta + (endTheta - startTheta) / 2;

        // 起始端点坐标
        polygon.points.push(
            new Point(centerX + radius * Math.cos(startTheta),
                centerY - radius * Math.sin(startTheta)));

        // 远处端点坐标（角度间隔的一半）
        polygon.points.push(
            new Point(centerX + midPointRadius * Math.cos(midPointTheta),
                centerY - midPointRadius * Math.sin(midPointTheta)));

        // 结束端点坐标
        polygon.points.push(
            new Point(centerX + radius * Math.cos(endTheta),
                centerY - radius * Math.sin(endTheta)));

        // 起始端点坐标
        polygon.points.push(
            new Point(centerX + radius * Math.cos(startTheta),
                centerY - radius * Math.sin(startTheta)));

        polygons.push(polygon);

        startTheta += thetaDelta;
    }
    return polygons;
}

// 圆屋顶dome
var DOME_SIDES = 15,
    DOME_X = 275,
    DOME_Y = 235,
    DOME_RADIUS = 232,
    domePolygons = createDomePolygons(DOME_X, DOME_Y, DOME_RADIUS, DOME_SIDES);

// 将圆顶三角存储到shapes中
domePolygons.forEach(function (polygon) {
    shapes.push(polygon);
});

if (showPolygonsOnly)
    actuatorSprite.visible = false;

//  挡板质心
rightFlipperShape.centroid = function () {
    return new Point(450, 930);
};

leftFlipperShape.centroid = function () {
    return new Point(60, 930);
};

showingHighScores = false;

// 将图片push到game的数组中
game.queueImage('images/rightFlipper.png');
game.queueImage('images/leftFlipper.png');
game.queueImage('images/ball.png');
game.queueImage('images/tryAgain.png');

game.queueImage('images/fiftyBumperBright.png');
game.queueImage('images/oneHundredBumperBright.png');
game.queueImage('images/fiveHundredBumperBright.png');

game.queueImage('images/oneXBumperLeftBright.png');
game.queueImage('images/oneXBumperRightBright.png');

game.queueImage('images/twoXBumperRightBright.png');
game.queueImage('images/twoXBumperLeftBright.png');

game.queueImage('images/fiveXBumperRightBright.png');
game.queueImage('images/fiveXBumperLeftBright.png');
game.queueImage('images/tryAgain.png');
game.queueImage('images/background.png');

for (var i = 0; i < LAUNCH_STEPS; ++i) {
    game.queueImage('images/actuator-' + i + '.png');
}


var interval = setInterval(function (e) {
    // 加载所有图片
    var percentComplete = game.loadImages();
    // 图片加载进度条
    progressbar.draw(percentComplete);

    if (percentComplete >= 100) {
        clearInterval(interval);

        // 隐藏进度条
        progressDiv.style.display = 'none';
        loadingToast.style.display = 'none';

        // 显示‘是否只显示碰撞多边形’复选框
        showPolygonsOnlyToast.style.display = 'block';
        showPolygonsOnlyToast.style.left = '290px';
        scoreToast.style.display = 'inline';

        launching = true;
        loading = false;

        score = 0;
        scoreToast.innerText = '0'; // won't get set till later, otherwise

        // 开始绘制小球和发射台
        ballSprite.visible = true;
        actuatorSprite.visible = true;
        //game.playSound('pinball');

        // 加载发射器图片
        for (var i = 0; i < LAUNCH_STEPS; ++i) {
            launchImages[i] = new Image();
            launchImages[i].src = 'images/actuator-' + i + '.png';
        }

        // 开始游戏
        game.start();
    }
}, 16);