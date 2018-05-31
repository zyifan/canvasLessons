//#region 验证两个面是否相交的算法 (此函数摘抄自网络)
function intersectsPolygonAndPolygon (polygon1LinearRings, polygon2LinearRings) {

// polygon1LinearRings : array[LinearRing,...]
function intersectsByPolygon (polygon1LinearRings, polygon2LinearRings) {
var intersect = false;

intersect = intersectsByLinearRings(polygon1LinearRings, polygon2LinearRings);

if(!intersect) {
    // check if this poly contains points of the ring/linestring
    for(i=0, len=polygon2LinearRings.length; i<len; ++i) {
        var point = polygon2LinearRings[i];
        intersect = containsPointByLinearRing(point, polygon1LinearRings);
        if(intersect) {
            break;
        }
    }
}

return intersect;
}

// LinearRings
function containsPointByPolygon (point, LinearRings) {
var numRings = LinearRings.length;
var contained = false;
if(numRings > 0) {
    contained = containsPointByLinearRing(point, LinearRings[0]);
    if( numRings > 1) {
        // check interior rings
        var hole;
        for(var i=1; i<numRings; ++i) {
            hole = containsPointByLinearRing(point, LinearRings[i]);
            if(hole) {
                if(hole === 1) {
                    // on edge
                    contained = 1;
                } else {
                    // in hole
                    contained = false;
                }
                break;
            }
        }
    }
}
return contained;
}

// LinearRing : array[pt]
// point : {x:1,y:2}
function containsPointByLinearRing (point, LinearRing) {

//limitSigDigs
function approx(num, sig) {
    var fig = 0;
    if (sig > 0) {
        fig = parseFloat(num.toPrecision(sig));
    }
    return fig;
}

var digs = 14;
var px = approx(point.x, digs);
var py = approx(point.y, digs);
function getX(y, x1, y1, x2, y2) {
    return (y - y2) * ((x2 - x1) / (y2 - y1)) + x2;
}

var numSeg = LinearRing.length - 1;
var start, end, x1, y1, x2, y2, cx, cy;
var crosses = 0;

for(var i=0; i<numSeg; ++i) {
    start = LinearRing[i];
    x1 = approx(start.x, digs);
    y1 = approx(start.y, digs);
    end = LinearRing[i + 1];
    x2 = approx(end.x, digs);
    y2 = approx(end.y, digs);

    if(y1 == y2) {
        // horizontal edge
        if(py == y1) {
            // point on horizontal line
            if(x1 <= x2 && (px >= x1 && px <= x2) || // right or vert
                x1 >= x2 && (px <= x1 && px >= x2)) { // left or vert
                // point on edge
                crosses = -1;
                break;
            }
        }
        // ignore other horizontal edges
        continue;
    }
    cx = approx(getX(py, x1, y1, x2, y2), digs);
    if(cx == px) {
        // point on line
        if(y1 < y2 && (py >= y1 && py <= y2) || // upward
            y1 > y2 && (py <= y1 && py >= y2)) { // downward
            // point on edge
            crosses = -1;
            break;
        }
    }
    if(cx <= px) {
        // no crossing to the right
        continue;
    }
    if(x1 != x2 && (cx < Math.min(x1, x2) || cx > Math.max(x1, x2))) {
        // no crossing
        continue;
    }
    if(y1 < y2 && (py >= y1 && py < y2) || // upward
        y1 > y2 && (py < y1 && py >= y2)) { // downward
        ++crosses;
    }
}

var contained = (crosses == -1) ?
    // on edge
    1 :
    // even (out) or odd (in)
    !!(crosses & 1);

return contained;
}


function intersectsByLinearRings (LinearRing1, LinearRings2) {
var intersect = false;
var segs1 = getSortedSegments(LinearRing1);
var segs2 = getSortedSegments(LinearRings2);

var seg1, seg1x1, seg1x2, seg1y1, seg1y2,
    seg2, seg2y1, seg2y2;
// sweep right
outer: for(var i=0, len=segs1.length; i<len; ++i) {
    seg1 = segs1[i];
    seg1x1 = seg1.x1;
    seg1x2 = seg1.x2;
    seg1y1 = seg1.y1;
    seg1y2 = seg1.y2;
    inner: for(var j=0, jlen=segs2.length; j<jlen; ++j) {
        seg2 = segs2[j];
        if(seg2.x1 > seg1x2) {
            // seg1 still left of seg2
            break;
        }
        if(seg2.x2 < seg1x1) {
            // seg2 still left of seg1
            continue;
        }
        seg2y1 = seg2.y1;
        seg2y2 = seg2.y2;
        if(Math.min(seg2y1, seg2y2) > Math.max(seg1y1, seg1y2)) {
            // seg2 above seg1
            continue;
        }
        if(Math.max(seg2y1, seg2y2) < Math.min(seg1y1, seg1y2)) {
            // seg2 below seg1
            continue;
        }
        if(segmentsIntersect(seg1, seg2)) {
            intersect = true;
            break outer;
        }
    }
}
return intersect;
}

function getSortedSegments(points) {
var numSeg = points.length - 1;
var segments = new Array(numSeg), point1, point2;
for(var i=0; i<numSeg; ++i) {
    point1 = points[i];
    point2 = points[i + 1];
    if(point1.x < point2.x) {
        segments[i] = {
            x1: point1.x,
            y1: point1.y,
            x2: point2.x,
            y2: point2.y
        };
    } else {
        segments[i] = {
            x1: point2.x,
            y1: point2.y,
            x2: point1.x,
            y2: point1.y
        };
    }
}
// more efficient to define this somewhere static
function byX1(seg1, seg2) {
    return seg1.x1 - seg2.x1;
}
return segments.sort(byX1);
}

function segmentsIntersect(seg1, seg2, options) {
var point = options && options.point;
var tolerance = options && options.tolerance;
var intersection = false;
var x11_21 = seg1.x1 - seg2.x1;
var y11_21 = seg1.y1 - seg2.y1;
var x12_11 = seg1.x2 - seg1.x1;
var y12_11 = seg1.y2 - seg1.y1;
var y22_21 = seg2.y2 - seg2.y1;
var x22_21 = seg2.x2 - seg2.x1;
var d = (y22_21 * x12_11) - (x22_21 * y12_11);
var n1 = (x22_21 * y11_21) - (y22_21 * x11_21);
var n2 = (x12_11 * y11_21) - (y12_11 * x11_21);
if(d == 0) {
    // parallel
    if(n1 == 0 && n2 == 0) {
        // coincident
        intersection = true;
    }
} else {
    var along1 = n1 / d;
    var along2 = n2 / d;
    if(along1 >= 0 && along1 <= 1 && along2 >=0 && along2 <= 1) {
        // intersect
        if(!point) {
            intersection = true;
        } else {
            // calculate the intersection point
            var x = seg1.x1 + (along1 * x12_11);
            var y = seg1.y1 + (along1 * y12_11);
            intersection = { 'x':x, 'y':y };
        }
    }
}
if(tolerance) {
    var dist;
    if(intersection) {
        if(point) {
            var segs = [seg1, seg2];
            var seg, x, y;
            // check segment endpoints for proximity to intersection
            // set intersection to first endpoint within the tolerance
            outer: for(var i=0; i<2; ++i) {
                seg = segs[i];
                for(var j=1; j<3; ++j) {
                    x = seg["x" + j];
                    y = seg["y" + j];
                    dist = Math.sqrt(
                        Math.pow(x - intersection.x, 2) +
                        Math.pow(y - intersection.y, 2)
                    );
                    if(dist < tolerance) {
                        intersection.x = x;
                        intersection.y = y;
                        break outer;
                    }
                }
            }

        }
    } else {
        // no calculated intersection, but segments could be within
        // the tolerance of one another
        var segs = [seg1, seg2];
        var source, target, x, y, p, result;
        // check segment endpoints for proximity to intersection
        // set intersection to first endpoint within the tolerance
        outer: for(var i=0; i<2; ++i) {
            source = segs[i];
            target = segs[(i+1)%2];
            for(var j=1; j<3; ++j) {
                p = {x: source["x"+j], y: source["y"+j]};
                result = distanceToSegment(p, target);
                if(result.distance < tolerance) {
                    if(point) {
                        intersection = { 'x':p.x, 'y':p.y };
                    } else {
                        intersection = true;
                    }
                    break outer;
                }
            }
        }
    }
}
return intersection;
};

function distanceToSegment(point, segment) {
var result = distanceSquaredToSegment(point, segment);
result.distance = Math.sqrt(result.distance);
return result;
};

function distanceSquaredToSegment(point, segment) {
var x0 = point.x;
var y0 = point.y;
var x1 = segment.x1;
var y1 = segment.y1;
var x2 = segment.x2;
var y2 = segment.y2;
var dx = x2 - x1;
var dy = y2 - y1;
var along = ((dx * (x0 - x1)) + (dy * (y0 - y1))) /
    (Math.pow(dx, 2) + Math.pow(dy, 2));
var x, y;
if(along <= 0.0) {
    x = x1;
    y = y1;
} else if(along >= 1.0) {
    x = x2;
    y = y2;
} else {
    x = x1 + along * dx;
    y = y1 + along * dy;
}
return {
    distance: Math.pow(x - x0, 2) + Math.pow(y - y0, 2),
    x: x, y: y,
    along: along
};
}

return intersectsByPolygon(polygon1LinearRings, polygon2LinearRings);
}
//#endregion
// 判断所有区域是否和其它区域有重复
function railsIsOverlap (rails) {
var i, j, k, v, l, n;
if (rails.length < 2) {
return false;
}
for (i = 0, j = rails.length - 1; i < j; i++) {
var rail = rails[i];
var railPath = rail.getPath();
for (k = i + 1, v = rails.length; k < v; k++) {
    var railed = rails[k];
    var railedPath = railed.getPath();
    for (l = 0 , n = railPath.length; l < n; l ++) {
        if (BMapLib.GeoUtils.isPointInPolygon(new BMap.Point(railPath[l].lng, railPath[l].lat), railed)) {
            // layer.alert("片区不能重复");
            return true;
        }
    }
    for (l = 0, n =  railedPath.length; l < n; l ++) {
        if (BMapLib.GeoUtils.isPointInPolygon(new BMap.Point(railedPath[l].lng, railedPath[l].lat), rail)) {
            // console.log(53)
            // layer.alert("片区不能重复");
            return true;
        }
    }
}
}

var lines = [];
for ( i = 0 ; i < rails.length; i ++) {
var line = rails[i].getPath();
lines.push([]);
for (j = 0 ;j < line.length ; j ++) {
    var p = {
        x: line[j].lng,
        y: line[j].lat
    };
    lines[i].push(p);
}

lines[i].push(lines[i][0])
}
for (i = 0; i < lines.length - 1; i ++) {
var p1 = lines[i];
for (j = i + 1; j < lines.length; j ++) {
    var p2 = lines[j];
    if (intersectsPolygonAndPolygon(p1,p2)) {
        // layer.alert("片区不能重复！");
        return true;
    }
}
}
return false;
}

// 判断当前某一个区域是否和其它区域有重复
function railsIsOverlapCur (rails,index) {
    var i, j, k, v, l, n;
    if (rails.length < 2) {
        return false;
    }
    var curRail = rails[index]
    var curRailPath = curRail.getPath();

    for (k = 0, v = rails.length; k < v; k++) {
        if(k == index){
            continue;
        }
        var railed = rails[k];
        var railedPath = railed.getPath();
        for (l = 0 , n = curRailPath.length; l < n; l ++) {
            if (BMapLib.GeoUtils.isPointInPolygon(new BMap.Point(curRailPath[l].lng, curRailPath[l].lat), railed)) {
                // layer.alert("片区不能重复");
                // console.log("片区不能重复1");
                return true;
            }
        }
        for (l = 0, n =  railedPath.length; l < n; l ++) {
            if (BMapLib.GeoUtils.isPointInPolygon(new BMap.Point(railedPath[l].lng, railedPath[l].lat), curRail)) {
                // console.log(53)
                // layer.alert("片区不能重复");
                // console.log("片区不能重复2");
                return true;
            }
        }
    }

    var lines = [];
    for ( i = 0 ; i < rails.length; i ++) {
        var line = rails[i].getPath();
        lines.push([]);
        for (j = 0 ;j < line.length ; j ++) {
            var p = {
                x: line[j].lng,
                y: line[j].lat
            };
            lines[i].push(p);
        }

        lines[i].push(lines[i][0])
    }

    var p1 = lines[index];
    for (j = 0; j < lines.length; j ++) {
        if(j == index){
            continue;
        }
        var p2 = lines[j];
        if (intersectsPolygonAndPolygon(p1,p2)) {
            // layer.alert("片区不能重复！");
            // console.log("片区不能重复3");
            return true;
        }
    }
    return false;
}

//使用时直接调用railsIsOverlap函数就行，参数是多边形数组