$(document).ready(function () {

	// 获取canvas对象
	var space = document.getElementById("surface");
	var surface = space.getContext("2d");
	surface.scale(1, 1);

	// Set Particles 粒子
	var particles = [];
	var particle_count = 150; //粒子数量
	for (var i = 0; i < particle_count; i++) {
		particles.push(new particle());
	}

	var time = 0;
	// 设置wrapper、canvas 的宽高
	var canvasWidth = 320;
	var canvasHeight = 480;
	$(".wrapper").css({
		width: canvasWidth,
		height: canvasHeight
	});
	$("#surface").css({
		width: canvasWidth,
		height: canvasHeight
	});

	// requestAnimationFrame兼容写法
	window.requestAnimFrame = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 6000 / 60);
			};
	})();

	// 粒子对象
	function particle() {
		this.speed = {
			x: -1 + Math.random() * 2, //[-1,1)
			y: -5 + Math.random() * 5 //[-5,0)
		};

		// canva的宽、高
		canvasWidth = (document.getElementById("surface").width);
		canvasHeight = (document.getElementById("surface").height);

		// canvas中心点
		this.location = {
			x: canvasWidth / 2,
			y: (canvasHeight / 2) + 35
		};

		this.radius = .5 + Math.random() * 1; //半径为[0.5,1.5)
		
		this.life = 10 + Math.random() * 10; //life [10,20)
		this.death = this.life;

		// 随机取一个红色值
		this.r = 255;
		this.g = Math.round(Math.random() * 155); //[0,155)
		this.b = 0;
	}

	function ParticleAnimation() {
		surface.globalCompositeOperation = "source-over";//绘制的图形将画在现有画布之上
		surface.fillStyle = "black";
		surface.fillRect(0, 0, canvasWidth, canvasHeight);
		surface.globalCompositeOperation = "lighter";//源与目标重叠，就将两者的颜色值想加。得到的颜色值的最大取值为255

		for (var i = 0; i < particles.length; i++) {
			var p = particles[i];

			surface.beginPath();

			// death（15-20） 步内慢慢的向上外平移，且透明度一直减小，一旦超过death步数，则替换成新的粒子，继续从中心点开始向外移动
			p.opacity = Math.round(p.death / p.life * 100) / 100 //opacity一直减小
			var gradient = surface.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
			gradient.addColorStop(0, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
			gradient.addColorStop(0.5, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
			gradient.addColorStop(1, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", 0)");
			surface.fillStyle = gradient;
			surface.arc(p.location.x, p.location.y, p.radius, Math.PI * 2, false);
			surface.fill();

			p.death--;//death减1
			p.radius++;//半径加1

			// speed.y > speed.x （Y轴移动距离大于X轴移动距离——火苗长窄），speed.y < speed.x （Y轴移动距离小于X轴移动距离——火苗宽短）
			p.location.x += (p.speed.x); //x的坐标向左或者向右
			p.location.y += (p.speed.y); //y的坐标一直向上

			//regenerate particles
			if (p.death < 0 || p.radius < 0) {
				//a brand new particle replacing the dead one
				particles[i] = new particle();
			}
		}

		// 调用自身
		requestAnimFrame(ParticleAnimation);

	}

	ParticleAnimation();

});