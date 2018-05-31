// 文字形状文件
function Shape(x, y, texte) {
	// x , y: 要绘制的文字的位置
	this.x = x;
	this.y = y;
	this.size = 150; //文字大小font-size

	this.text = texte; //texte: 要绘制的文字
	this.placement = [];
	//this.vectors = [];
}

/*//idata 为一个对象
	var idata = cxt.getImageData(0, 0, W, H);
	
	ImageData {data: Uint8ClampedArray[1885276], width: 733, height: 643}

		data:Uint8ClampedArray[1885276] //8位无符号整形数组
		height:643
		width:733
	
	var buffer32 = new Uint32Array(idata.data.buffer);

	/*
		将8位无符号整形数组，转换成32位的,范围为[471318]
	*/
Shape.prototype.getValue = function () {

	//draw the shape 绘制文字
	context.textAlign = "center";
	context.font = this.size + "px arial";
	context.fillText(this.text, this.x, this.y);

	// 获取canvas上绘制的图片的数据内容
	var idata = context.getImageData(0, 0, W, H);
	// idata.data.buffer  在这里我们调用Uint8ClampedArray对象的buffer属性，获取此数组引用的 ArrayBuffer。
	// 然后将它传入Uint32Array对象(32位无符号整数值的类型化数组）。
	// 此时，我们看看上面绘制图像的数据变成什么样了，首先数组长度减小,刚好是上面的8位的四分之一，
	// 相当于我们把一张图片的分辨率缩小了，如果以前有640000个数据， 那么现在只有160000个数据
	var buffer32 = new Uint32Array(idata.data.buffer);

	// 在有数据的地方，放上我们的粒子，gridY = 7, gridX = 7;
	// 我们遍历整个canvas, 通过buffer32[j * W + i]来判断这个位置的数据是否为空，如果不为空，那么，在这绘制一个粒子。粒子的位置为（i，j）我们作为参数传入
	// gridX和gridY，它们的作用是来判断每个多少个距离取一次数据。
	// 学过信号抽样的同学应该很好理解，如果你间隔大，抽样得到的数据就小，反之如果你设定的间隔小，那么抽到的数据就多。
	// 在我们的效果中，我们绘制的是文字，同样的道理，间隔小获取的数据就多，粒子就多，组成的文字就完整。
	// 间隔大获取的就少。那么粒子组成的文字就不那么完整，这两个变量的值，通过分辨率控件来绑定
	for (var j = 0; j < H; j += gridY) {
		for (var i = 0; i < W; i += gridX) {

			if (buffer32[j * W + i]) {
				// 粒子对象
				var particle = new Particle(i, j, type);
				this.placement.push(particle);
			}
		}
	}

	// 绘制完文字，获取到数据之后，清空canvas
	context.clearRect(0, 0, W, H);

}