// 简单树
// 只是用到简单的 lineTo,moveTo 等API
function Tree(color) {
  this.x = 0;
  this.y = 0;
  this.xpos = 0;
  this.ypos = 0;
  this.zpos = 0;

  this.scaleX = 1;
  this.scaleY = 1;

  this.color = utils.parseColor(color);

  this.alpha = 1;
  this.lineWidth = 1;
  this.branch = [];

  //generate some random branch positions
  // 主树杆
  this.branch[0] = -140 - Math.random() * 20; //[-160,-140) 终点y坐标

  // 分枝1
  this.branch[1] = -30 - Math.random() * 30; //[-60,-30) 起点y坐标
  this.branch[2] = Math.random() * 80 - 40; //[-40,50) 终点x坐标
  this.branch[3] = -100 - Math.random() * 40; //[-140,-100) 终点y坐标

  // 分枝2
  this.branch[4] = -60 - Math.random() * 40; //[-100,-60) 起点y坐标
  this.branch[5] = Math.random() * 60 - 30; //[30,60) 终点x坐标
  this.branch[6] = -110 - Math.random() * 20; //[-130,-110) 终点y坐标

}

Tree.prototype.draw = function (context) {
  context.save();
  context.translate(this.x, this.y);
  context.scale(this.scaleX, this.scaleY);

  context.lineWidth = this.lineWidth;
  context.strokeStyle = utils.colorToRGB(this.color, this.alpha);

  // 主树杆，最长[-160,-140) 
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, this.branch[0]);

  // 在树杆中间随机画一条线
  context.moveTo(0, this.branch[1]);
  context.lineTo(this.branch[2], this.branch[3]);

  // 在树杆中间随机画一条线
  context.moveTo(0, this.branch[4]);
  context.lineTo(this.branch[5], this.branch[6]);

  context.stroke();
  context.restore();
}