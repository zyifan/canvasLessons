// 坐标对象Point{x,y}
var Point = function (x, y) {
    this.x = x;
    this.y = y;
};

//  多边形基础对象
var Shape = function () {
    this.x = undefined;
    this.y = undefined;
    this.strokeStyle = 'rgba(255, 253, 208, 0.9)';
    this.fillStyle = 'rgba(147, 197, 114, 0.8)';
};

Shape.prototype = {
    //  如果碰撞则返回true
    collidesWith: function (shape) {
        // 获取当前多边形和需要检测碰撞的多边形的投影轴数组
        var axes = this.getAxes().concat(shape.getAxes());
        return !this.separationOnAxes(axes, shape);
    },
    // 将两个受测对象分别投放到每条投影轴上，只要在某条轴上发现了相互分离的投影，那么该方法就返回true，否则返回false
    separationOnAxes: function (axes, shape) {
        // 遍历法向量数组
        for (var i = 0; i < axes.length; ++i) {
            axis = axes[i];
            // 获取两个多边形的投影，包含多边形端点在axis上投影的最大值、最小值
            projection1 = shape.project(axis);
            projection2 = this.project(axis);

            // 如果没有交集overlaps返回false
            if (!projection1.overlaps(projection2)) {
                return true; // don't have to test remaining axes
            }
        }
        return false;
    },

    // move移动
    move: function (dx, dy) {
        throw 'move(dx, dy) not implemented';
    },

    // createPath创建多边形
    createPath: function (context) {
        throw 'createPath(context) not implemented';
    },

    // getAxes返回一个向量数组，其中每个元素都表示一条投影轴
    getAxes: function () {
        throw 'getAxes() not implemented';
    },

    // project返回该多边形在某条轴上的投影
    project: function (axis) {
        throw 'project(axis) not implemented';
    },

    // 填充多边形
    fill: function (context) {
        context.save();
        context.fillStyle = this.fillStyle;
        this.createPath(context);
        context.fill();
        context.restore();
    },

    // 绘制多边形边框
    stroke: function (context) {
        context.save();
        context.strokeStyle = this.strokeStyle;
        this.createPath(context);
        context.stroke();
        context.restore();
    },

    // 判断坐标是否在多边形内
    isPointInPath: function (context, x, y) {
        this.createPath(context);
        return context.isPointInPath(x, y);
    },
};


//  投影对象
var Projection = function (min, max) {
    this.min = min;
    this.max = max;
};

Projection.prototype = {
    // 计算投影交集
    overlaps: function (projection) {
        // 如果有交集返回true，this.max > projection.min &&  this.min < projection.max
        // 如果没有交集返回false，this.max <= projection.min || this.min >= projection.max
        return this.max > projection.min && projection.max > this.min;
    }
};

//  边缘法向量 对象
var Vector = function (point) {
    if (point === undefined) {
        this.x = 0;
        this.y = 0;
    } else {
        this.x = point.x;
        this.y = point.y;
    }
};

Vector.prototype = {
    // 获取（x,y）点对应的斜边长度
    getMagnitude: function () {
        return Math.sqrt(Math.pow(this.x, 2) +
            Math.pow(this.y, 2));
    },

    // 获取向量的点积（数量积、内积） 
    // 数量积a·b的几何意义是：a的长度|a|与b在a的方向上的投影|b|cos θ的乘积
    // a·b=x1·x2+y1·y2
    // 如果有一个向量为法向量，即向量长度为1，则向量积的结果为 1*|b|*cos θ = |b|cos θ，即 b 在 a 上的投影长度
    dotProduct: function (vector) {
        return this.x * vector.x +
            this.y * vector.y;
    },

    // A(X1,Y1) B(X2,Y2)，则A+B=（X1+X2，Y1+Y2），A-B=（X1-X2，Y1-Y2）
    // 返回向量的和
    add: function (vector) {
        var v = new Vector();
        v.x = this.x + vector.x;
        v.y = this.y + vector.y;
        return v;
    },

    // 返回向量的差
    subtract: function (vector) {
        var v = new Vector();
        v.x = this.x - vector.x;
        v.y = this.y - vector.y;
        return v;
    },

    // 得到边缘向量的正规化之后的垂直向量
    // 正规化就是讲向量的长度缩减为1
    // 正规化后的向量又叫单位向量（unit vector）
    normalize: function () {
        var v = new Vector(0, 0),
            m = this.getMagnitude();

        if (m != 0) {
            v.x = this.x / m;
            v.y = this.y / m;
        }
        return v;
    },

    // 得到边缘向量的垂直向量
    // 两个向量垂直（如向量A和向量B）可得：两个向量相乘得到0（即：A·B=0）
    // 设向量A=（x1,y1）和向量B=(x2,y2)用坐标表示为：A·B = x1*x2 + y1*y2 = 0 
    // (-x1)*x2 = y1*y2 即 -x1 = y2, x2 = y1
    perpendicular: function () {
        var v = new Vector();
        v.x = this.y;
        v.y = 0 - this.x;
        return v;
    },

    // 返回向量的差
    edge: function (vector) {
        return this.subtract(vector);
    },

    // 获取单位向量
    normal: function () {
        var p = this.perpendicular();
        return p.normalize();
    }
};


// 获取多边形距离圆心最近的端点
function getPolygonPointClosestToCircle(polygon, circle) {
    var min = 10000,
        length,
        testPoint,
        closestPoint;

    // 遍历多边形端点
    for (var i = 0; i < polygon.points.length; ++i) {
        testPoint = polygon.points[i];
        // 获取当前端点到圆心的距离
        length = Math.sqrt(
            Math.pow(testPoint.x - circle.x, 2),
            Math.pow(testPoint.y - circle.y, 2));

        if (length < min) {
            min = length;
            closestPoint = testPoint;
        }
    }

    return closestPoint;
};

// 多边形和圆形是否碰撞
function polygonCollidesWithCircle(polygon, circle) {
    var min = 10000, v1, v2,
        edge, perpendicular,
        // 获取多边形的投影法向量
        axes = polygon.getAxes(),
        // 获取多边形距离圆心最近的端点
        closestPoint = getPolygonPointClosestToCircle(polygon, circle);

    v1 = new Vector(new Point(circle.x, circle.y));//圆心向量
    v2 = new Vector(new Point(closestPoint.x, closestPoint.y));//端点向量

    // 获取圆形到端点的向量的法向量，并添加到多边形法向量数组中
    axes.push(v1.subtract(v2).normalize());

    return !polygon.separationOnAxes(axes, circle);
};

//  多边形对象
var Polygon = function () {
    // 顶点坐标数组
    this.points = [];
    this.strokeStyle = 'blue';
    this.fillStyle = 'white';
};

Polygon.prototype = new Shape();//Polygon 继承自shape

Polygon.prototype.collidesWith = function (shape) {
    var axes = shape.getAxes();

    if (axes === undefined) { //circle 圆和多边形碰撞
        return polygonCollidesWithCircle(this, shape);

    } else { // 多边形和多边形碰撞
        axes.concat(this.getAxes());
        return !this.separationOnAxes(axes, shape);
    }
};

// getAxes 返回一个向量数组，其中每个元素都表示一条投影轴
// 获取所有边框的单位垂直法向量，即投影轴
Polygon.prototype.getAxes = function () {
    var v1, v2, edge, perpendicular, normal, axes = [];

    // 遍历多边形端点坐标，获取所有边框的单位垂直法向量
    for (var i = 0; i < this.points.length - 1; i++) {
        // 两个端点坐标V1、V2向量
        v1 = new Vector(this.points[i]);
        v2 = new Vector(this.points[i + 1]);

        // edge获取边缘法向量，normal获取边缘法向量的单位垂直法向量
        axes.push(v1.edge(v2).normal());
    }

    // 获取第一个端点和最后一个端点连线的边框的垂直法向量
    v1 = new Vector(this.points[this.points.length - 1]);
    v2 = new Vector(this.points[0]);
    axes.push(v1.edge(v2).normal());

    return axes;
};

// project返回该多边形在某条轴上的投影
// axis 投影轴，垂直法向量
Polygon.prototype.project = function (axis) {
    var scalars = [];//所有端点在axis上投影长度的集合

    this.points.forEach(function (point) {
        // 获取每个端点在单位法向量axis上的投影长度值
        // 由于法向量的长度是1，所有点积的结果是端点投影长度
        scalars.push(new Vector(point).dotProduct(axis));
    });

    // 对比所有端点在axis轴上投影长度
    // 返回一个包含最小投影和最大投影值的投影对象
    return new Projection(Math.min.apply(Math, scalars),
        Math.max.apply(Math, scalars));
};

// 添加顶点坐标
Polygon.prototype.addPoint = function (x, y) {
    this.points.push(new Point(x, y));
};

// createPath 创建多边形
Polygon.prototype.createPath = function (context) {
    if (this.points.length === 0)
        return;

    context.beginPath();
    context.moveTo(this.points[0].x,
        this.points[0].y);

    for (var i = 0; i < this.points.length; ++i) {
        context.lineTo(this.points[i].x,
            this.points[i].y);
    }

    context.closePath();
};

// move 根据鼠标位移获取移动后的多边形端点坐标，将多边形移动dx，dy距离
Polygon.prototype.move = function (dx, dy) {
    var point, x;
    for (var i = 0; i < this.points.length; ++i) {
        point = this.points[i];
        point.x += dx;
        point.y += dy;
    }
};

Polygon.prototype.move = function (dx, dy) {
    for (var i = 0, point; i < this.points.length; ++i) {
        point = this.points[i];
        point.x += dx;
        point.y += dy;
    }
};

//  圆对象
var Circle = function (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.strokeStyle = 'rgba(255, 253, 208, 0.9)';
    this.fillStyle = 'rgba(147, 197, 114, 0.8)';
}

Circle.prototype = new Shape();

Circle.prototype.collidesWith = function (shape) {
    var point, length, min = 10000, v1, v2,
        edge, perpendicular, normal,
        axes = shape.getAxes(), distance;

    if (axes === undefined) {  // circle 圆和圆碰撞
        distance = Math.sqrt(Math.pow(shape.x - this.x, 2) +
            Math.pow(shape.y - this.y, 2));

        return distance < Math.abs(this.radius + shape.radius);
    }
    else {  // polygon 圆和多边形碰撞
        return polygonCollidesWithCircle(shape, this);
    }
};

Circle.prototype.getAxes = function () {
    return undefined; // there are an infinite number of axes for circles
};

//   project 获取投影对象
Circle.prototype.project = function (axis) {
    var scalars = [],
        point = new Point(this.x, this.y);
    dotProduct = new Vector(point).dotProduct(axis);

    scalars.push(dotProduct);
    scalars.push(dotProduct + this.radius);
    scalars.push(dotProduct - this.radius);

    return new Projection(Math.min.apply(Math, scalars),
        Math.max.apply(Math, scalars));
};

//  move 移动圆
Circle.prototype.move = function (dx, dy) {
    this.x += dx;
    this.y += dy;
};

//  createPath 创建圆
Circle.prototype.createPath = function (context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
};



//  图像对象，将图像当成矩形判断碰撞
var ImageShape = function (imageSource, x, y, w, h) {
    var self = this;

    this.image = new Image();
    this.imageLoaded = false;
    this.points = [new Point(x, y)];//存储图像四个角的坐标
    this.x = x;
    this.y = y;

    this.image.src = imageSource;

    this.image.addEventListener('load', function (e) {
        // 获取图片四个角坐标
        self.setPolygonPoints();
        self.imageLoaded = true;
    }, false);
}

ImageShape.prototype = new Polygon();//继承自多边形对象

ImageShape.prototype.fill = function (context) { };

ImageShape.prototype.setPolygonPoints = function () {
    // 右上角坐标
    this.points.push(new Point(this.x + this.image.width, this.y));
    // 右下角坐标
    this.points.push(new Point(this.x + this.image.width, this.y + this.image.height));
    // 左下角坐标
    this.points.push(new Point(this.x, this.y + this.image.height));
};

// 将图像绘制到画布上
ImageShape.prototype.drawImage = function (context) {
    context.drawImage(this.image, this.points[0].x, this.points[0].y);
};

// 绘制图像
ImageShape.prototype.stroke = function (context) {
    var self = this;

    if (this.imageLoaded) {
        context.drawImage(this.image, this.points[0].x, this.points[0].y);
    } else {
        this.image.addEventListener('load', function (e) {
            self.drawImage(context);
        }, false);
    }
};


//  精灵对象，将精灵对象看做正方形判断碰撞
var SpriteShape = function (sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    sprite.left = x;
    sprite.top = y;
    // 获取精灵对象的四个角坐标
    this.setPolygonPoints();
};

SpriteShape.prototype = new Polygon();

SpriteShape.prototype.move = function (dx, dy) {
    var point, x;
    for (var i = 0; i < this.points.length; ++i) {
        point = this.points[i];
        point.x += dx;
        point.y += dy;
    }
    this.sprite.left = this.points[0].x;
    this.sprite.top = this.points[0].y;
};

SpriteShape.prototype.fill = function (context) { };

SpriteShape.prototype.setPolygonPoints = function () {
    // 获取精灵对象的四个角坐标
    this.points.push(new Point(this.x, this.y));
    this.points.push(new Point(this.x + this.sprite.width, this.y));
    this.points.push(new Point(this.x + this.sprite.width, this.y + this.sprite.height));
    this.points.push(new Point(this.x, this.y + this.sprite.height));
};

SpriteShape.prototype.stroke = function (context) {
    this.sprite.paint(context);
};