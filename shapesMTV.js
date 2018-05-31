function polygonCollidesWithPolygon(p1, p2, displacement) { // displacement for p1
    // 获取p1、p2最小平移向量（最小重叠阴影所对应的法向量）
    var mtv1 = p1.minimumTranslationVector(p1.getAxes(), p2, displacement), //getMTV(p1, p2, displacement, p1.getAxes());
        mtv2 = p1.minimumTranslationVector(p2.getAxes(), p2, displacement); //getMTV(p2, p1, displacement, p2.getAxes());

    // 如果未碰撞
    if (mtv1.overlap === 0 || mtv2.overlap === 0)
        return {
            axis: undefined,
            overlap: 0
        };
    else
        return mtv1.overlap < mtv2.overlap ? mtv1 : mtv2; //碰撞，返回最小平移向量
};

// ..............................................................
// Check to see if a circle collides with another circle
// ..............................................................

function circleCollidesWithCircle(c1, c2) {
    // 请两个圆的圆心距离
    var distance = Math.sqrt(Math.pow(c2.x - c1.x, 2) +
            Math.pow(c2.y - c1.y, 2)),
        overlap = Math.abs(c1.radius + c2.radius) - distance;

    // 如果碰撞则返回（undefined，0），否则返回（undefined，圆心距离差值）
    return overlap < 0 ?
        new MinimumTranslationVector(undefined, 0) :
        new MinimumTranslationVector(undefined, overlap);
};

// ..............................................................
// Get the polygon's point that's closest to the circle
// 获取距离圆心最近的多边形端点坐标
// ..............................................................

function getPolygonPointClosestToCircle(polygon, circle) {
    var min = BIG_NUMBER,
        length,
        testPoint,
        closestPoint;

    for (var i = 0; i < polygon.points.length; ++i) {
        testPoint = polygon.points[i];
        length = Math.sqrt(Math.pow(testPoint.x - circle.x, 2),
            Math.pow(testPoint.y - circle.y, 2));
        if (length < min) {
            min = length;
            closestPoint = testPoint;
        }
    }

    return closestPoint;
};

// ..............................................................
// Get the circle's axis (circle's don't have an axis, so this
// method manufactures one)
// ..............................................................

function getCircleAxis(circle, polygon, closestPoint) {
    var v1 = new Vector(new Point(circle.x, circle.y)),
        v2 = new Vector(new Point(closestPoint.x, closestPoint.y)),
        surfaceVector = v1.subtract(v2);

    return surfaceVector.normalize();
};

// ..............................................................
// Tests to see if a polygon collides with a circle
// ..............................................................

function polygonCollidesWithCircle(polygon, circle, displacement) {
    var axes = polygon.getAxes(),
        // 获取距离圆心最近的端点的坐标
        closestPoint = getPolygonPointClosestToCircle(polygon, circle);

    // 获取连线的法向量
    axes.push(getCircleAxis(circle, polygon, closestPoint));

    // getMTV(polygon, circle, displacement, axes)
    return polygon.minimumTranslationVector(axes, circle, displacement);
};

// ..............................................................
// Given two shapes, and a set of axes, returns the minimum
// translation vector.
// ..............................................................
// 阴影最小重叠向量
// 获取最小移动向量mtv，不断的比较阴影重叠长度，最后保存最小的阴影
function getMTV(shape1, shape2, displacement, axes) {
    var minimumOverlap = BIG_NUMBER,
        overlap,
        axisWithSmallestOverlap,
        mtv;

    for (var i = 0; i < axes.length; ++i) {
        axis = axes[i];
        // 获取投影范围值
        projection1 = shape1.project(axis);
        projection2 = shape2.project(axis);

        // 获取阴影重叠长度
        overlap = projection1.getOverlap(projection2);

        // 重叠长度为0，即没有碰撞
        if (overlap === 0) {
            return new MinimumTranslationVector(undefined, 0);
        } else {
            // 存储最小重叠长度
            if (overlap < minimumOverlap) {
                minimumOverlap = overlap;
                axisWithSmallestOverlap = axis;
            }
        }
    }
    // 创建
    mtv = new MinimumTranslationVector(axisWithSmallestOverlap,
        minimumOverlap);
    return mtv;
};


// Constants.....................................................

var BIG_NUMBER = 1000000;


// Points........................................................

var Point = function (x, y) {
    this.x = x;
    this.y = y;
};

Point.prototype = {
    rotate: function (rotationPoint, angle) {
        var tx, ty, rx, ry;

        tx = this.x - rotationPoint.x; // tx = translated X
        ty = this.y - rotationPoint.y; // ty = translated Y

        rx = tx * Math.cos(-angle) - // rx = rotated X
            ty * Math.sin(-angle);

        ry = tx * Math.sin(-angle) + // ry = rotated Y
            ty * Math.cos(-angle);

        return new Point(rx + rotationPoint.x, ry + rotationPoint.y);
    }
};

// Lines.........................................................

var Line = function (p1, p2) {
    this.p1 = p1; // point 1
    this.p2 = p2; // point 2
}

Line.prototype.intersectionPoint = function (line) {
    var m1, m2, b1, b2, ip = new Point();

    if (this.p1.x === this.p2.x) {
        m2 = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
        b2 = line.p1.y - m2 * line.p1.x;
        ip.x = this.p1.x;
        ip.y = m2 * ip.x + b2;
    } else if (line.p1.x === line.p2.x) {
        m1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
        b1 = this.p1.y - m1 * this.p1.x;
        ip.x = line.p1.x;
        ip.y = m1 * ip.x + b1;
    } else {
        m1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
        m2 = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
        b1 = this.p1.y - m1 * this.p1.x;
        b2 = line.p1.y - m2 * line.p1.x;
        ip.x = (b2 - b1) / (m1 - m2);
        ip.y = m1 * ip.x + b1;
    }
    return ip;
};

// Bounding boxes................................................

var BoundingBox = function (left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
};


// Vectors.......................................................
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
    // 设置向量长度
    setMagnitude: function (m) {
        var uv = this.normalize();
        this.x = uv.x * m;
        this.y = uv.y * m;
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
        var v = new Vector(),
            // 获取线段长度
            m = this.getMagnitude();
        v.x = this.x / m;
        v.y = this.y / m;
        return v;
    },

    // 得到边缘向量的垂直向量
    // 两个向量垂直（如向量A和向量B）可得：两个向量相乘得到0（即：A·B=0）
    // 设向量A=（x1,y1）和向量B=(x2,y2)用坐标表示为：A·B = x1*x2 + y1*y2 = 0 
    // (-x1)*x2 = y1*y2 即  x2 = y1，y2 = -x1 ,
    perpendicular: function () {
        var v = new Vector();
        v.x = this.y;
        v.y = 0 - this.x;
        return v;
    },

    reflect: function (axis) {
        var dotProductRatio, vdotl, ldotl, v = new Vector(),
            vdotl = this.dotProduct(axis),
            ldotl = axis.dotProduct(axis),
            dotProductRatio = vdotl / ldotl;

        v.x = 2 * dotProductRatio * axis.x - this.x;
        v.y = 2 * dotProductRatio * axis.y - this.y;

        return v;
    }
};


// Shapes........................................................
//  多边形基础对象
var Shape = function () {
    this.fillStyle = 'rgba(255, 255, 0, 0.8)';
    this.strokeStyle = 'white';
};

Shape.prototype = {
    move: function (dx, dy) {
        throw 'move(dx, dy) not implemented';
    },

    createPath: function (context) {
        throw 'createPath(context) not implemented';
    },

    boundingBox: function () {
        throw 'boundingBox() not implemented';
    },

    fill: function (context) {
        context.save();
        context.fillStyle = this.fillStyle;
        this.createPath(context);
        context.fill();
        context.restore();
    },

    stroke: function (context) {
        context.save();
        context.strokeStyle = this.strokeStyle;
        this.createPath(context);
        context.stroke();
        context.restore();
    },

    collidesWith: function (shape, displacement) {
        throw 'collidesWith(shape, displacement) not implemented';
    },

    // 判断坐标是否在多边形内
    isPointInPath: function (context, x, y) {
        // 创建路径
        this.createPath(context);
        return context.isPointInPath(x, y);
    },

    // project返回该多边形在某条轴上的投影
    project: function (axis) {
        throw 'project(axis) not implemented';
    },

    // 获取最小平移向量：MTV（Minimum Translation Vector）
    minimumTranslationVector: function (axes, shape, displacement) {
        return getMTV(this, shape, displacement, axes);
    }
};


// Circles.......................................................
//  圆对象
var Circle = function (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.strokeStyle = 'blue';
    this.fillStyle = 'yellow';
}

Circle.prototype = new Shape();

//  获取中心点point
Circle.prototype.centroid = function () {
    return new Point(this.x, this.y);
};

Circle.prototype.move = function (dx, dy) {
    this.x += dx;
    this.y += dy;
};

Circle.prototype.boundingBox = function (dx, dy) {
    return new BoundingBox(this.x - this.radius,
        this.y - this.radius,
        2 * this.radius,
        2 * this.radius);
};

Circle.prototype.createPath = function (context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
};

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
// 检测碰撞
Circle.prototype.collidesWith = function (shape, displacement) {
    if (shape.radius === undefined) { //如果是多边形
        return polygonCollidesWithCircle(shape, this, displacement);
    } else { //如果是圆形
        return circleCollidesWithCircle(this, shape, displacement);
    }
};


// Polygons......................................................

var Polygon = function () {
    this.points = [];
    this.strokeStyle = 'blue';
    this.fillStyle = 'white';
};

Polygon.prototype = new Shape();

// 获取单位法向量
Polygon.prototype.getAxes = function () {
    var v1, v2, surfaceVector, axes = [],
        pushAxis = true;

    for (var i = 0; i < this.points.length - 1; i++) {
        v1 = new Vector(this.points[i]);
        v2 = new Vector(this.points[i + 1]);

        surfaceVector = v2.subtract(v1);
        // 得到边缘向量的垂直向量
        axes.push(surfaceVector.perpendicular().normalize());
    }

    return axes;
};
// 获取投影范围，的最小值和最大值
Polygon.prototype.project = function (axis) {
    var scalars = [];

    this.points.forEach(function (point) {
        scalars.push(new Vector(point).dotProduct(axis));
    });

    return new Projection(Math.min.apply(Math, scalars),
        Math.max.apply(Math, scalars));
};

// 添加端点坐标
Polygon.prototype.addPoint = function (x, y) {
    this.points.push(new Point(x, y));
};

// 创建多边形
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

// 移动多边形
Polygon.prototype.move = function (dx, dy) {
    var point, x;
    for (var i = 0; i < this.points.length; ++i) {
        point = this.points[i];
        x += dx;
        y += dy;
    }
};

// 判断碰撞
Polygon.prototype.collidesWith = function (shape, displacement) {
    if (shape.radius !== undefined) {
        return polygonCollidesWithCircle(this, shape, displacement);
    } else {
        return polygonCollidesWithPolygon(this, shape, displacement);
    }
};

Polygon.prototype.move = function (dx, dy) {
    for (var i = 0, point; i < this.points.length; ++i) {
        point = this.points[i];
        point.x += dx;
        point.y += dy;
    }
};

// 获取多边形端点坐标中的最小值和最大值
Polygon.prototype.boundingBox = function (dx, dy) {
    var minx = BIG_NUMBER,
        miny = BIG_NUMBER,
        maxx = -BIG_NUMBER,
        maxy = -BIG_NUMBER,
        point;

    for (var i = 0; i < this.points.length; ++i) {
        point = this.points[i];
        minx = Math.min(minx, point.x);
        miny = Math.min(miny, point.y);
        maxx = Math.max(maxx, point.x);
        maxy = Math.max(maxy, point.y);
    }

    return new BoundingBox(minx, miny,
        parseFloat(maxx - minx),
        parseFloat(maxy - miny));
};

// 获取端点和的平均值坐标，多边形重心
Polygon.prototype.centroid = function () {
    var pointSum = new Point(0, 0);

    for (var i = 0, point; i < this.points.length; ++i) {
        point = this.points[i];
        pointSum.x += point.x;
        pointSum.y += point.y;
    }
    return new Point(pointSum.x / this.points.length,
        pointSum.y / this.points.length);
}

// Projections...................................................

var Projection = function (min, max) {
    this.min = min;
    this.max = max;
};

Projection.prototype = {
    // 判断阴影是否重叠，重叠返回true
    overlaps: function (projection) {
        return this.max > projection.min && projection.max > this.min;
    },

    // 获取阴影重叠长度
    getOverlap: function (projection) {
        var overlap;

        // 如果没有重叠，说明没有碰撞，返回0
        if (!this.overlaps(projection))
            return 0;

        // 阴影重叠长度 overlap
        if (this.max > projection.max) {
            overlap = projection.max - this.min;
        } else {
            overlap = this.max - projection.min;
        }
        return overlap;
    }
};


// MinimumTranslationVector.........................................

// 最小平移向量对象，axis法向量，overlap阴影重叠长度
var MinimumTranslationVector = function (axis, overlap) {
    this.axis = axis;
    this.overlap = overlap;
};

var ImageShape = function (imageSource, x, y, w, h) {
    var self = this;

    this.image = new Image();
    this.imageLoaded = false;
    this.points = [new Point(x, y)];
    this.x = x;
    this.y = y;

    this.image.src = imageSource;

    this.image.addEventListener('load', function (e) {
        self.setPolygonPoints();
        self.imageLoaded = true;
    }, false);
}

ImageShape.prototype = new Polygon();

ImageShape.prototype.fill = function (context) {};

ImageShape.prototype.setPolygonPoints = function () {
    this.points.push(new Point(this.x + this.image.width, this.y));
    this.points.push(new Point(this.x + this.image.width, this.y + this.image.height));
    this.points.push(new Point(this.x, this.y + this.image.height));
    this.points.push(new Point(this.x, this.y));
    this.points.push(new Point(this.x + this.image.width, this.y));
};

ImageShape.prototype.drawImage = function (context) {
    context.drawImage(this.image, this.points[0].x, this.points[0].y);
};

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


var SpriteShape = function (sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    sprite.left = x;
    sprite.top = y;
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

SpriteShape.prototype.fill = function (context) {};

SpriteShape.prototype.setPolygonPoints = function () {
    this.points.push(new Point(this.x, this.y));
    this.points.push(new Point(this.x, this.y + this.sprite.height));
    this.points.push(new Point(this.x + this.sprite.width, this.y + this.sprite.height));
    this.points.push(new Point(this.x + this.sprite.width, this.y));
    this.points.push(new Point(this.x, this.y));
};
/*
SpriteShape.prototype.stroke = function (context) {
   this.sprite.paint(context);
};
*/