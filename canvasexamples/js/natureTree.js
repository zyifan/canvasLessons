// 自然树

function ranColor() {
    return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
}

/*
  spread: 树杈分支数
*/
// 自然树的原理与二叉树的原理完全一样，不同之处在于对树枝的分叉设置了更多的随机性

function NatureTree(ctx) {
    this.x = 0;
    this.y = 0;

    this.xpos = 0;
    this.ypos = 0;
    this.zpos = 0;

    this.scaleX = 0.85;
    this.scaleY = 0.85;

    this.ctx = ctx;

    this.alpha = 1;
    this.spread = 0.6;

    this.drawLeaves = true;
    // 随机取一个叶子颜色
    this.leavesColor = ranColor();

    this.max_branch_width = 20;
    this.max_branch_height = 60;

    this.small_leaves = 10; //树叶状态
    this.medium_leaves = 200;
    this.big_leaves = 500;
    this.thin_leaves = 900;

    // 叶子宽width
    this.leaveType = this.medium_leaves;
}
/**
 * 
 * @param {树杈分枝概率} spread 
 * @param {是否绘制树叶} leaves 
 * @param {树叶大小width} leaveType 
 */
NatureTree.prototype.draw = function (spread, leaves, leaveType) {
    //设置树杈分多少枝[0.3, 1]
    if (spread >= 0.3 && spread <= 1) {
        this.spread = spread;
    } else {
        this.spread = 0.6
    }

    //是否绘制树叶
    if (leaves === true || leaves === false) {
        this.drawLeaves = leaves;
    } else {
        this.drawLeaves = true;
    }

    if (leaveType == this.small_leaves ||
        leaveType == this.medium_leaves ||
        leaveType == this.big_leaves ||
        leaveType == this.thin_leaves) {
        this.leaveType = leaveType;
    } else {
        this.leaveType = this.medium_leaves;
    }

    this.ctx.save();
    this.ctx.lineWidth = 1 + Math.random() * this.max_branch_width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.translate(this.x, this.y);
    this.ctx.scale(this.scaleX, this.scaleY);
    this.branchAndLeaves(0);
    this.ctx.restore();
}

/**
 * 
 * @param {树杈迭代次数} gen 
 */
NatureTree.prototype.branchAndLeaves = function (gen) {
    // 每条循环主线，在12次以内都需要绘制树枝
    if (gen < 12) {
        this.ctx.save();

        // 绘制树枝
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -this.max_branch_height);
        this.ctx.stroke();

        // 设置原点
        this.ctx.translate(0, -this.max_branch_height);

        // 随机角度
        var randomN = -(Math.random() * 0.1) + 0.1;
        this.ctx.rotate(randomN);

        // 随机画左右侧树枝
        if ((Math.random() * 1) < this.spread) {
            //画左侧树枝
            this.ctx.rotate(-0.35);
            this.ctx.scale(0.7, 0.7);
            this.ctx.save();
            // 回调
            this.branchAndLeaves(gen + 1);
            this.ctx.restore();

            //画右侧树枝
            this.ctx.rotate(0.6);
            this.ctx.save();
            this.branchAndLeaves(gen + 1);
            this.ctx.restore();
        } else {

            this.branchAndLeaves(gen);

        }

        this.ctx.restore();

    } else {
        // 当一条循环线完成之后，绘制一个rect
        //枝条画完画树叶
        if (this.drawLeaves) {
            // 树叶高度
            var lengthFactor = 200;
            if (this.leaveType === this.thin_leaves) {
                leaveFactor = 10;
            }
            this.ctx.save();
            this.ctx.fillStyle = this.leavesColor;
            this.ctx.fillRect(0, 0, this.leaveType, lengthFactor);
            this.ctx.restore();
        }
    }
}