var canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	W = canvas.width = window.innerWidth;
 	H = canvas.height = window.innerHeight;
	gridY = 7, gridX = 7;

	type = "ball";

   colors = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722'
  ];

var message = document.getElementById('message'),//文字
	gravity = document.getElementById('gra'),//重力
	duration = document.getElementById('dur'),//周期
	speed = document.getElementById('speed'),//速度
	radius = document.getElementById('rad'),//半径
	resolution = document.getElementById('res');//分辨率

   graVal = parseFloat(gravity.value); // 0
   durVal = parseFloat(duration.value);// 0.4 周期，粒子半径增量
   spdVal = parseFloat(speed.value);// 0
   radVal = parseFloat(radius.value);// 2
   resVal = parseFloat(resolution.value);// 10	 

//0、 0.4、 0、 2、 10
console.log('graVal: '+graVal,'durVal: '+durVal,'spdVal: '+spdVal,'radVal: '+radVal,'resVal: '+resVal);

// 文字形状对象
var word = new Shape(W/2, H/2, message.value);
	// 获取文字所对应的粒子数组 
	word.getValue();

// 清空画布，重新获取粒子对象
function change(){
	  context.clearRect(0, 0, W, H);
	  gridX = parseFloat(resolution.value);
	  gridY = parseFloat(resolution.value);
	  word.placement = [];
	  word.text = message.value;
	  word.getValue();
}

// 更新重力、时间、速度、半径
function changeV() {
     graVal = parseFloat(gravity.value);
     durVal = parseFloat(duration.value); //粒子半径增量
     spdVal = parseFloat(speed.value);
     radVal = parseFloat(radius.value);
}

// 绘制所有粒子
(function drawFrame(){
	window.requestAnimationFrame(drawFrame, canvas);
	context.clearRect(0, 0, W, H);

	for(var i=0; i< word.placement.length; i++){
		word.placement[i].update();
	}
}())


//resize，重新获取画布的宽、高
function resize(){
	W = canvas.width = window.innerWidth;
 	H = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize, false);
