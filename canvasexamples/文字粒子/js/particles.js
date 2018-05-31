/**
 * 粒子对象
 * @param {*} x x坐标
 * @param {*} y y坐标
 * @param {*} type 类型，ball、rect
 */
function Particle(x, y, type) {
  // 最小半径和最大半径
  this.radius = 1.1;
  this.futurRadius = utils.randomInt(radVal, radVal+3); //[1.1,5.1]
  
  // 
  this.rebond = utils.randomInt(1, 5); //[1,6]
  // 坐标
  this.x = x;
  this.y = y;
  
  this.dying = false;
  
  this.base = [x, y];

  this.vx = 0;
  this.vy = 0;
  this.type = type;
  this.friction = .99;
  this.gravity = graVal;// 0
  this.color = colors[Math.floor(Math.random() * colors.length)];

  // 根据vx、vy获取speed
  this.getSpeed = function() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  };

  // 根据传入的速度，获取vx、vy
  this.setSpeed = function(speed) {
    var heading = this.getHeading();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  };

  // 根据vx、vy获取角度
  this.getHeading = function() {
    return Math.atan2(this.vy, this.vx);
  };

  // 根据传入的角度值heading，获取vx，vy
  this.setHeading = function(heading) {
    var speed = this.getSpeed();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  };

  // 更新小球状态
  this.update = function(heading) {
    // 更新坐标
    this.x += this.vx;
    this.y += this.vy;

    // 更新速度
    this.vy += graVal;//graVal 初始为0

    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // 如果半径小于 futurRadius [1.1,5.1]
    if(this.radius < this.futurRadius && this.dying === false){
      this.radius += durVal; //粒子半径增量[0.1-0.99]
    }else{
      this.dying = true;
    }
    
    // 如果dying为true，半径减小
    if(this.dying === true){
      this.radius -= durVal;
    }
    
    // 绘制小球
    if(type === "ball"){
      context.save();
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(this.x, this.y, this.radius, Math.PI * 2, false);
      context.closePath();
      context.fill();
      context.restore();
    }

    // 绘制方块
    if(type === "rect"){
      context.save();
      context.fillStyle = this.color;
      context.beginPath();
      context.fillRect(this.x, this.y, this.futurRadius, this.futurRadius)
      context.closePath();
      context.fill();
      context.restore();
    }
    

    // 如果 y<0 或者 radius <1，重置粒子位置为初始位置
    // 重置 dying、speed、vx、vy、radius、futurRadius
    if (this.y < 0 || this.radius < 1) {
      this.x = this.base[0];
      this.y = this.base[1];
      this.dying = false;
      this.radius = 1.1;
      
      // 设置速度，spdval初始为0
      this.setSpeed(spdVal);

      // 重置最大半径
      this.futurRadius = utils.randomInt(radVal, radVal+3);  

      // 根据角度重置vx、vy（初始为0，0）
      this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)));
    }

  }

  // 设置初始运动速度、角度
  // speed为[0.1, 0.6)，根据speed获取vx，vy
  this.setSpeed(utils.randomInt(.1, .5));
  // 角度为[0,360]，根据角度获取vx、vy
  this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)));

}
