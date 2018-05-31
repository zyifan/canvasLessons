var canvas, stage, exportRoot;
var hello;
function init() {
	// --- write your JS code here ---

	canvas = document.getElementById("canvas");
	exportRoot = new lib.Text3();

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	stage = new createjs.Stage(canvas);
	createjs.Touch.enable(stage);
	stage.addChild(exportRoot);
	stage.update();

	hello = exportRoot.hello;
	stage.on("stagemousedown", handleClick, this);

	container = new createjs.Container();
	exportRoot.addChild(container);

	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.on("tick", onTick);

	handleResize();
	window.addEventListener("resize", handleResize);

	createjs.Tween.get(this).wait(1000).call(function() {
    handleClick()
  })
  
}

function handleResize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	scale = Math.min(canvas.width, canvas.height)/720;

	exportRoot.scaleX = exportRoot.scaleY = scale;
	exportRoot.regX = 1024/2;
	exportRoot.regY = 600/2;
	exportRoot.x = canvas.width>>1;
	exportRoot.y = canvas.height>>1;
	stage.update(lastEvent);
}


function handleClick() {
	container.removeAllChildren();
	createjs.Tween.removeAllTweens();

	mapClip(hello.letter1, getRange(120, 160)| 0, {width:181, height:266});
	mapClip(hello.letter2, getRange(120, 160)| 0, {width:161, height:266});
	mapClip(hello.letter3, getRange(110, 130)| 0, {width:155, height:266});
	mapClip(hello.letter4, getRange(110, 130)| 0, {width:155, height:266});
	createjs.Tween.get(hello.letter5).to({alpha:0, y:hello.letter5.y + 200}, 1000);
}

function mapClip(clip, total, area) {
	for(var i=0;i<total;i++) {
		var pt = clip.localToGlobal(0, 0);
		var pt1 = exportRoot.globalToLocal(pt.x, pt.y);
		var _x = Math.random()*area.width | 0;
		var _y = Math.random()*area.height | 0;
		if (clip.hitTest(_x, _y)) {
			var _ball =  getParticle(100, "#F1d345", "rgba(143,0,0,0)");
			var scale = getRange(0.9,1.5);
			_ball.x = pt1.x+(_x*hello.scaleX);
			_ball.y = pt1.y+(_y*hello.scaleX);
			_ball.scaleX = _ball.scaleY = scale;
			createjs.Tween.get(_ball, {loop:true})
								.to({x:(_ball.x-150) + (Math.random()*250)|0, y:(_ball.y-50)-(Math.random()*350)|0}, 1500+Math.random()*2000 | 0)
								.to({x:(_ball.x-150) + (Math.random()*100)|0, y:(_ball.y-250)-(Math.random()*250)|0}, 1500+Math.random()*2500 | 0);
			_ball.compositeOperation = "lighter";
			container.addChild(_ball)
		}
	}
}

function getRange(min, max) {
	var scale = max - min;
	return Math.random()*scale + min;
}

function getParticle(radius, color1, color2) {
  var shape = new createjs.Shape();
  shape.graphics.rf([color1, color2], [0, 1], 0, 0, 0, 0, 0, radius/2).dc(0, 0, radius);
  shape.cache(-radius/2, -radius/2, radius, radius);
  return shape;
}

var lastEvent;
function onTick(event) {
	lastEvent = event;
	stage.update(event);
}
init();