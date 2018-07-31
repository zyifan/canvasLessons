// init函数第一个参数是页面刷新频率，第二个是canvas加到的div的id，第三个和第四个是页面尺寸，最后一个是页面初始化完成后调用的函数
init(100, "mylegend", 525, 500, main);
// 全屏
LSystem.screen(LStage.FULL_SCREEN);
// 层变量
var backLayer, tileLayer, ctrlLayer, overLayer, gameoverLayer, selectLayer;
// 字层变量
var tileText, overText, gameoverText;
// 行、列
var col, row;
// 时间
var time = 0;

// 关卡，在这个二维数组中，每一个数组就是一关，每一个数组中的文字就是关卡中要出现的字。这个游戏共5关
var checkpoints = [
	["籍", "藉"],
	["我", "找"],
	["春", "舂"],
	["龙", "尤"],
	["曰", "日"]
];
// 当前关卡，默认第0关
var checkpointNo = 0;

// 0-10的随机数
var i0;
var j0;

// 循环变量
var i, j;
var partX, partY;

// 通关提示语
var overTextContent = ["恭喜您，您过关了", "进入下一关", "重新开始"];
// 失败提示语
var gameoverTextContent = ["对不起，您失败了", "重开关卡"];

var nowLine;
var setTimeLine;

function main() {
	// 0-10之间的随即数
	i0 = Math.floor(Math.random() * 10);
	j0 = Math.floor(Math.random() * 10);

	initLayer();//初始化层
	initCtrl();//初始化控制
	initTile();//显示文字
}

// LSprite类的方法将层变量定义为了一个容器，以后要显示什么东西，就可以往这些容器中放。
// 其中addChild是把一个东西放进容器的函数，当然放进去的东西也可以是个容器。由此，游戏就有了层次感。
// 如果直接写addChild(xxx)就是把xxx放在游戏最底层
function initLayer() {
	backLayer = new LSprite();	
	addChild(backLayer);

	tileLayer = new LSprite();
	backLayer.addChild(tileLayer);

	ctrlLayer = new LSprite();
	backLayer.addChild(ctrlLayer);
}

function initCtrl() {
	// 初始化行、列总数
	col = 10;
	row = 10;

	// 添加层、事件
	addEvent();
	addTimeLine();
}

function initTile() {
	for (i = 0; i < row; i++) {
		for (j = 0; j < col; j++) {
			tile();
		}
	}
}

// 绘制方格和字
function tile() {
	// 绘制50*50的灰方格
	tileLayer.graphics.drawRect(3, "dimgray", [j * 50, i * 50, 50, 50], true, "lightgray");

	var w = checkpoints[checkpointNo][(i == i0 && j == j0) ? 0 : 1];//(i0,j0)位置取0位置的字，其它位置取1位置
	tileText = new LTextField();
	tileText.weight = "bold";
	tileText.text = w;
	tileText.size = 25;
	tileText.color = "lightgray";
	tileText.font = "黑体";
	tileText.x = j * 50 + 7;
	tileText.y = i * 50 + 7;
	tileLayer.addChild(tileText);

	// 添加阴影
	// 阴影的偏移距离、角度、颜色
	var shadow = new LDropShadowFilter(1, 15, "#000000");
	tileLayer.filters = [shadow];
}

function addEvent(event) {
	// 通关层
	overLayer = new LSprite();
	backLayer.addChild(overLayer);

	// 选择层
	selectLayer = new LSprite();
	backLayer.addChild(selectLayer);

	// 游戏结束层
	gameoverLayer = new LSprite();
	backLayer.addChild(gameoverLayer);

	// 文字层添加鼠标点击事件
	tileLayer.addEventListener(LMouseEvent.MOUSE_DOWN, onDown);
	// 选择层添加鼠标弹起事件
	selectLayer.addEventListener(LMouseEvent.MOUSE_UP, gameReStart);
	// 结束层添加鼠标弹起事件
	gameoverLayer.addEventListener(LMouseEvent.MOUSE_UP, reTry);
}

function gameReStart() {
	i0 = Math.floor(Math.random() * 10);
	j0 = Math.floor(Math.random() * 10);

	time = 0;

	tileLayer.removeAllChild();
	overLayer.removeAllChild();
	selectLayer.removeAllChild();
	backLayer.removeChild(selectLayer);
	backLayer.removeChild(overLayer);
	if (checkpointNo != checkpoints.length - 1) {
		checkpointNo++;
	}
	initTile();
	addEvent();
	addTimeLine();
}

function reTry() {
	i0 = Math.floor(Math.random() * 10);
	j0 = Math.floor(Math.random() * 10);

	time = 0;

	tileLayer.removeAllChild();
	overLayer.removeAllChild();
	gameoverLayer.removeAllChild();
	selectLayer.removeAllChild();
	backLayer.removeChild(selectLayer);
	backLayer.removeChild(overLayer);
	backLayer.removeChild(gameoverLayer);

	initTile();
	addEvent();
	addTimeLine();
}

function addTimeLine() {
	overLayer.graphics.drawRect(5, "dimgray", [500, 0, 20, 500], true, "lightgray");
	// drawline(lineWidth,lineColor,[startX,startY,endX,endY])
	overLayer.graphics.drawLine(15, "lightgray", [510, 3, 510, 497]);
	overLayer.graphics.drawLine(15, "red", [510, 3, 510, 497]);

	setTimeLine = setInterval(function () {
		drawTimeLine();
	}, 100);
}

function drawTimeLine() {
	// 每100毫秒就移至3+((time/5)*495)/10位置 (3-498)
	nowLine = 3 + ((time / 5) * 495) / 10;
	// 绘制灰线
	overLayer.graphics.drawLine(15, "lightgray", [510, 3, 510, 497]);
	// 绘制红线
	overLayer.graphics.drawLine(15, "red", [510, nowLine, 510, 497]);
	time++;
	if (time > 50) {
		clearInterval(setTimeLine);
		gameOver();
	}
}

function gameOver() {
	overLayer.graphics.drawRect(5, "dimgray", [(LGlobal.width - 420) * 0.5, 80, 420, 250], true, "lightgray");
	gameoverLayer.graphics.drawRect(5, "dimgray", [(LGlobal.width - 250) * 0.5, 230, 250, 50], true, "darkgray");

	for (var i = 0; i < gameoverTextContent.length; i++) {
		gameoverText = new LTextField();
		gameoverText.weight = "bold";
		gameoverText.color = "dimgray";
		gameoverText.font = "黑体";
		if (i == 0) {
			gameoverText.text = gameoverTextContent[i];
			gameoverText.size = 35;
			gameoverText.x = (LGlobal.width - gameoverText.getWidth()) * 0.5;
			gameoverText.y = 120;
			gameoverLayer.addChild(gameoverText);
		} else if (i == 1) {
			gameoverText.text = gameoverTextContent[i];
			gameoverText.size = 20;
			gameoverText.x = (LGlobal.width - gameoverText.getWidth()) * 0.5;
			gameoverText.y = 240;
			gameoverLayer.addChild(gameoverText);
		}
	}
	tileLayer.removeEventListener(LMouseEvent.MOUSE_DOWN, onDown);
}

function onDown(event) {
	var mouseX, mouseY;
	mouseX = event.offsetX;
	mouseY = event.offsetY;

	partX = Math.floor((mouseX) / 50);
	partY = Math.floor((mouseY) / 50);
	isTure(partX, partY);
}

function isTure(x, y) {
	if (x == j0 && y == i0) {
		clearInterval(setTimeLine);
		overLayer.graphics.drawRect(5, "dimgray", [(LGlobal.width - 420) * 0.5, 80, 420, 250], true, "lightgray");
		selectLayer.graphics.drawRect(5, "dimgray", [(LGlobal.width - 250) * 0.5, 230, 250, 50], true, "darkgray");

		for (var i = 0; i < overTextContent.length; i++) {
			overText = new LTextField();
			overText.weight = "bold";
			overText.color = "dimgray";
			overText.font = "黑体";
			if (i == 0) {
				overText.text = overTextContent[i];
				overText.size = 35;
				overText.x = (LGlobal.width - overText.getWidth()) * 0.5;
				overText.y = 120;
				overLayer.addChild(overText);
			} else if (i == 1) {
				if (checkpointNo == checkpoints.length - 1) {
					overText.text = overTextContent[i + 1];
					overText.size = 20;
					overText.x = (LGlobal.width - overText.getWidth()) * 0.5;
					overText.y = 240;
					selectLayer.addChild(overText);
					checkpointNo = 0;
				} else {
					overText.text = overTextContent[i];
					overText.size = 20;
					overText.x = (LGlobal.width - overText.getWidth()) * 0.5;
					overText.y = 240;
					selectLayer.addChild(overText);
				}
			}
		}
		tileLayer.removeEventListener(LMouseEvent.MOUSE_DOWN, onDown);
	}
}