// 游戏引擎
var game = new Game('ungame', 'gameCanvas'),

    // Loading 首屏加载....................................................

    loading = false, // not yet, see the end of this file
    // 首屏信息弹框
    loadingToast = document.getElementById('loadingToast'),
    // 首屏加载中信息提示元素
    loadingMessage = document.getElementById('loadingMessage'),
    // 首屏信息提示标题
    loadingToastTitle = document.getElementById('loadingToastTitle'),
    // 首屏信息内容容器
    loadingToastBlurb = document.getElementById('loadingToastBlurb'),
    // 首屏加载图片按钮
    loadButton = document.getElementById('loadButton'),
    // 首屏进度条容器
    progressDiv = document.getElementById('progressDiv'),
    // 创建进度条对象
    progressbar = new COREHTML5.Progressbar(300, 25, 'rgba(0,0,0,0.5)', 100, 130, 250),

    // Score 得分......................................................
    // 得分信息弹框
    scoreToast = document.getElementById('scoreToast'),
    scoreReadout = document.getElementById('score'),
    score = 0,
    lastScore = 0,
    lastScoreUpdate = undefined,


    // High Score 高分榜.................................................

    HIGH_SCORES_DISPLAYED = 10,
    // 高分榜信息弹框
    highScoreToast = document.getElementById('highScoreToast'),
    // 高分榜当前分数
    highScoreParagraph = document.getElementById('highScoreParagraph'),
    // 高分榜分数列表
    highScoreList = document.getElementById('highScoreList'),
    // 高分榜预览提示标题
    previousHighScoresTitle = document.getElementById('previousHighScoresTitle'),
    // 高分榜名字输入框
    nameInput = document.getElementById('nameInput'),
    // 高分榜存储分数到localstorage
    addMyScoreButton = document.getElementById('addMyScoreButton'),
    // 游戏结束时，开始新游戏按钮
    newGameButton = document.getElementById('newGameButton'),
    // 开始新游戏按钮
    newGameFromHighScoresButton =
    document.getElementById('newGameFromHighScoresButton'),
    // 清除分数localstorage存储复选框
    clearHighScoresCheckbox = document.getElementById('clearHighScoresCheckbox'),


    // Lives 生命浮动框canvas......................................................

    livesCanvas = document.getElementById('livesCanvas'),
    livesContext = livesCanvas.getContext('2d'),
    livesLeft = 3,//三条命
    life = 100,


    // Paused 暂停按钮及信息框.....................................................

    pausedToast = document.getElementById('pausedToast'),


    // Game Over 游戏结束信息框..................................................

    gameOverToast = document.getElementById('gameOverToast'),
    gameOver = false,

    // Sun Constants 太阳常量..............................................

    SUN_TOP = 110,
    SUN_LEFT = 450,
    SUN_RADIUS = 80,

    // Key Listeners..............................................

    lastKeyListenerTime = 0, // For throttling arrow keys, see below

    // Lose life 失去生命按钮及信息框..................................................

    loseLifeToast = document.getElementById('loseLifeToast'),
    loseLifeButton = document.getElementById('loseLifeButton'),

    // Scrolling the background 移动game canvas绘制中心点...................................

    translateDelta = 0.025,
    translateOffset = 0,

    scrollBackground = function () {
        translateOffset = (translateOffset + translateDelta) % game.context.canvas.width;
        game.context.translate(-translateOffset, 0);
    },

    // Paint Methods 绘制方法..............................................
    // 绘制太阳
    paintSun = function (context) {
        context.save();

        context.strokeStyle = 'orange';
        context.fillStyle = 'yellow';
        context.strokeStyle = 'orange';
        context.lineWidth = 1;

        context.beginPath();
        context.arc(SUN_LEFT, SUN_TOP, SUN_RADIUS, 0, Math.PI * 2, true);
        context.fill();
        context.stroke();

        context.stroke();
        context.restore();
    },
    // 绘制远处的云彩
    paintFarCloud = function (context, x, y) {
        context.save();
        scrollBackground();
        context.lineWidth = 0.5;
        context.strokeStyle = 'rgba(100, 140, 230, 0, 0.8)';
        context.fillStyle = 'rgba(255,255,255,0.4)';
        context.beginPath();

        context.moveTo(x + 102, y + 91);
        context.quadraticCurveTo(x + 180, y + 110, x + 250, y + 90);
        context.quadraticCurveTo(x + 312, y + 87, x + 279, y + 60);
        context.quadraticCurveTo(x + 321, y + 20, x + 265, y + 20);
        context.quadraticCurveTo(x + 219, y + 4, x + 171, y + 23);
        context.quadraticCurveTo(x + 137, y + 5, x + 104, y + 18);
        context.quadraticCurveTo(x + 57, y + 23, x + 79, y + 48);
        context.quadraticCurveTo(x + 57, y + 74, x + 104, y + 92);
        context.closePath();
        context.stroke();
        context.fill();
        context.restore();
    },

    // 绘制近处的云彩
    paintNearCloud = function (context, x, y) {
        context.save();
        scrollBackground();
        scrollBackground();
        context.lineWidth = 0.5;
        context.strokeStyle = 'rgba(100, 140, 230, 0, 0.8)';
        context.fillStyle = 'rgba(255,255,255,0.4)';
        context.beginPath();

        context.fillStyle = 'rgba(255,255,255,0.7)';

        context.moveTo(x + 364, y + 37);
        context.quadraticCurveTo(x + 426, y + 28, x + 418, y + 72);
        context.quadraticCurveTo(x + 450, y + 123, x + 388, y + 114);
        context.quadraticCurveTo(x + 357, y + 144, x + 303, y + 115);
        context.quadraticCurveTo(x + 251, y + 118, x + 278, y + 83);
        context.quadraticCurveTo(x + 254, y + 46, x + 320, y + 46);
        context.quadraticCurveTo(x + 326, y + 12, x + 362, y + 37);
        context.closePath();
        context.stroke();
        context.fill();
        context.restore();
    },

    // Game over 游戏结束..................................................

    over = function () {
        var highScore;
        // 从 local storage 获取分数数组
        highScores = game.getHighScores();

        // 如果分数大于最高分，存储并显示分数列表
        if (highScores.length == 0 || score > highScores[0].score) {
            // 显示分数及分数列表
            showHighScores();
        } else {
            //否则显示gameover弹框
            gameOverToast.style.display = 'inline';
        }

        // 设置状态
        gameOver = true;
        // 最后得分
        lastScore = score;
        score = 0;
    };


// Pause and Auto-pause 暂停和自动暂停.......................................

togglePaused = function () {
    game.togglePaused();// 暂停并继续游戏
    pausedToast.style.display = game.paused ? 'inline' : 'none';
};

// 点击暂停提示框时，隐藏提示框
pausedToast.onclick = function (e) {    
    pausedToast.style.display = 'none';
    togglePaused();
};
// window失去焦点时，暂停游戏
// 当游戏所在窗口失去焦点时自动暂停游戏，当窗口重新获取焦点时再让游戏继续运行，或是提供某种机制让用户自行恢复游戏
window.onblur = function windowOnBlur() {
    if (!loading && !gameOver && !game.paused) {
        togglePaused();
        pausedToast.style.display = game.paused ? 'inline' : 'none';
    }
};
// window获取焦点时，开启游戏
window.onfocus = function windowOnFocus() {
    if (game.paused) {
        togglePaused();
        pausedToast.style.display = game.paused ? 'inline' : 'none';
    }
};


// New game 开始新游戏按钮..................................................

newGameButton.onclick = function (e) {
    gameOverToast.style.display = 'none';
    loseLifeToast.style.display = 'inline';
    startNewGame();
};

// 恢复初始状态
function startNewGame() {
    // 隐藏高分榜
    highScoreParagraph.style.display = 'none';
    gameOver = false;
    livesLeft = 3;
    score = 0;
    loseLifeButton.focus();
};

// High Scores 高分榜................................................

// 显示分数
showHighScores = function () {
    highScoreParagraph.style.display = 'inline';
    highScoreParagraph.innerHTML = score;
    highScoreToast.style.display = 'inline';
    updateHighScoreList();
    nameInput.focus();
};

// 显示分数列表
updateHighScoreList = function () {
    var el,
        highScores = game.getHighScores(),// 从 local storage 获取分数数组
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
            el.innerHTML = highScore.score +
                ' by ' + highScore.name;
            highScoreList.appendChild(el);
        }
    } else {
        previousHighScoresTitle.style.display = 'none';
    }
}

// 添加分数按钮点击事件
addMyScoreButton.onclick = function (e) {
    // 将分数存储到 localstorage 中. 
    game.setHighScore({
        name: nameInput.value,
        score: lastScore
    });
    // 更新分数列表
    updateHighScoreList();
    addMyScoreButton.disabled = 'true';
    nameInput.value = '';
};

// 新游戏按钮点击事件
newGameFromHighScoresButton.onclick = function (e) {
    loseLifeToast.style.display = 'inline';
    highScoreToast.style.display = 'none';
    startNewGame();
};

// 名称输入框键盘事件
nameInput.onkeyup = function (e) {
    if (nameInput.value.length > 0) {
        addMyScoreButton.disabled = false;
    } else {
        addMyScoreButton.disabled = true;
    }
};

// Score Display 更新分数..............................................

updateScore = function () {
    if (!loading && game.lastScoreUpdate !== undefined) {
        if (game.gameTime - game.lastScoreUpdate > 1000) {
            scoreToast.style.display = 'inline';
            score += 10;
            scoreToast.innerHTML = score.toFixed(0);
            game.lastScoreUpdate = game.gameTime;
        }
    } else {
        game.lastScoreUpdate = game.gameTime;
    }
};

// Lives Display 绘制生命提示框..............................................
updateLivesDisplay = function () {
    var x, y, RADIUS = 10;

    livesContext.clearRect(0, 0, livesCanvas.width, livesCanvas.height);

    for (var i = 0; i < livesLeft; ++i) {
        x = 20 + i * 25;
        y = 20;

        livesContext.beginPath();
        livesContext.arc(x, y, RADIUS, 0, Math.PI * 2, false);
        livesContext.fill();
        livesContext.strokeText(parseInt(i + 1), x - RADIUS / 3, y + RADIUS / 3);
        livesContext.stroke();
    }
};

// Game Paint Methods.........................................
// 绘制近处稍小的那团云彩
game.paintOverSprites = function () {
    paintNearCloud(game.context, 120, 20);
    paintNearCloud(game.context, game.context.canvas.width + 120, 20);
}
// 绘制太阳及远处稍大的那团云彩，更新分数及玩家生命数的显示信息
game.paintUnderSprites = function () { // Draw things other than sprites
    if (!gameOver && livesLeft === 0) {
        over();
    } else {
        paintSun(game.context);
        paintFarCloud(game.context, 20, 20);
        paintFarCloud(game.context, game.context.canvas.width + 20, 20);

        if (!gameOver) {
            // 更新左上角分数
            updateScore();
        }
        // 绘制生命提示框
        updateLivesDisplay();
    }
};

// Key Listeners..............................................
// 监听p键，暂停播放
game.addKeyListener({
    key: 'p',
    listener: function () {
        game.togglePaused();
    }
});
// 监听右箭头按键
game.addKeyListener({
    key: 'right arrow',
    listener: function () {
        var now = +new Date();
        if (now - lastKeyListenerTime > 200) { // throttle
            lastKeyListenerTime = now;
        }
    }
});
// 监听左箭头按键
game.addKeyListener({
    key: 'left arrow',
    listener: function () {
        var now = +new Date();
        if (now - lastKeyListenerTime > 200) { // throttle
            lastKeyListenerTime = now;
        }
    }
});

// Initialization 初始化生命弹框canvas样式.............................................
livesContext.strokeStyle = 'slateblue';
livesContext.fillStyle = 'yellow';

// 点击‘失去生命’按钮
loseLifeButton.onclick = function (e) {
    // 生命数减1
    livesLeft--;
    // 播放whoosh音乐
    game.playSound('whoosh');

    if (livesLeft === 0) {
        // 如果没有生命，隐藏按钮
        loseLifeToast.style.display = 'none';
    }
};

// 复选框点击按钮，清除 local storage 中的分数
clearHighScoresCheckbox.onclick = function (e) {
    if (clearHighScoresCheckbox.checked) {
        game.clearHighScores();
    }
};

// Load game..................................................

loading = true;

// 点击加载按钮
loadButton.onclick = function (e) {
    var interval,
        loadingPercentComplete = 0;

    e.preventDefault();

    loadButton.style.display = 'none';//隐藏加载按钮

    // loading....提示信息
    loadingMessage.style.display = 'block';
    // 显示进度条容器
    progressDiv.style.display = 'block';
    // 将进度条对象元素添加到页面div容器里面
    progressDiv.appendChild(progressbar.domElement);

    // 调用此方法将图像url添加到game的imageUrls数组中.
    game.queueImage('images/image1.png');
    game.queueImage('images/image2.png');
    game.queueImage('images/image3.png');
    game.queueImage('images/image4.png');
    game.queueImage('images/image5.png');
    game.queueImage('images/image6.png');
    game.queueImage('images/image7.png');
    game.queueImage('images/image8.png');
    game.queueImage('images/image9.png');
    game.queueImage('images/image10.png');
    game.queueImage('images/image11.png');
    game.queueImage('images/image12.png');

    // 每16ms执行一次
    interval = setInterval(function (e) {
        // 重复调用此方法，去加载数组imageUrls中的图片，获取图片加载进度百分比 
        loadingPercentComplete = game.loadImages();

        // 如果加载完成
        if (loadingPercentComplete === 100) {
            // 清除定时器
            clearInterval(interval);

            // 500ms后隐藏加载提示信息和进度条
            setTimeout(function (e) {
                loadingMessage.style.display = 'none';
                progressDiv.style.display = 'none';

                // 500ms后隐藏首屏信息和标题容器div
                setTimeout(function (e) {
                    loadingToastBlurb.style.display = 'none';
                    loadingToastTitle.style.display = 'none';

                    // 500ms后，隐藏首屏信息弹框、显示‘失去生命’按钮
                    setTimeout(function (e) {
                        loadingToast.style.display = 'none';
                        loseLifeToast.style.display = 'block';
                        // 播放pop音乐
                        game.playSound('pop');

                        // 1000ms之后，设置加载状态，初始化分数等
                        setTimeout(function (e) {
                            loading = false;
                            score = 10;
                            scoreToast.innerText = '10'; // won't get set till later, otherwise
                            scoreToast.style.display = 'inline';
                            game.playSound('pop');
                            loseLifeButton.focus();

                        }, 1000);

                    }, 500);

                }, 500);

            }, 500);
        }

        // 根据百分比绘制进度条
        progressbar.draw(loadingPercentComplete);

    }, 16);
};

// Start game 开始游戏.................................................

game.start();