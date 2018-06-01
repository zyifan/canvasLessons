/*pagram  x, y : 树的坐标*/
/*pagram  angle : 树枝的偏转角度*/
/*pagram  genNum : 树枝的代数*/
/*pagram  branchLength : 树枝的长度*/

// 二叉树
// 二叉树的原理是采用递归的方法实现树枝与树干的绘制

function Tree(color, angle, genNum, branchLength){
    this.x = 0;
	this.y = 0;
	
	this.xpos = 0;
	this.ypos = 0;
	this.zpos = 0
	
	this.scaleX = 0.85;
	this.scaleY = 0.85;

	this.gen = 0;
    this.alpha = 1;
	this.color = utils.parseColor(color);
	this.angle = (angle === undefined) ? 0.3 : angle;
	this.genNum = (genNum === undefined) ? 6 : genNum;
	this.branchLength = (branchLength === undefined) ? 40 : branchLength;
	
}

Tree.prototype.draw = function(ctx){
	ctx.save()
	ctx.translate(this.x, this.y);
	this.branch(ctx, 0);//初始角度为0， 绘制树干
	ctx.restore();
}

Tree.prototype.branch= function(ctx, initAngle){
	this.gen++;

	ctx.save();
	ctx.strokeStyle = this.color;
	// 旋转、缩放
	ctx.rotate(initAngle);
	ctx.scale(this.scaleX, this.scaleY);

	// 从（0，0）画一条线到(0,-this.branchLength); 此时（0,-this.branchLength）为原点
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.translate(0, -this.branchLength);
	ctx.lineTo(0, 0);
	ctx.stroke();

	// 回调画分枝，原点为上一次的终点
	if(this.gen <= this.genNum){//判断当前的节点代数是否大于设置的节点数
		this.branch(ctx, this.angle);//画右边树枝
		this.branch(ctx, -this.angle);//画左侧树枝
	}
	// 在恢复画布之前一直在旋转
	ctx.restore();

	this.gen--;
}