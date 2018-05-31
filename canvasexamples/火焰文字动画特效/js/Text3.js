(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 1024,
	height: 600,
	fps: 30,
	color: "#FFFFFF",
	manifest: []
};



// symbols:



(lib.Letter5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s(1).p("Am8UaQi5hIhuimQg5hTgphrIg/juQgxkGAAl1QAAj4AxmAIA/jvQAphsA5hTQBuimC5hLQBagnBvgRIDzgWIDyAWQBxARBbAnQBcAkBIA9QBKA+A4BSQBvCmAwEIQAzGAAAD4QgRHMgiCvIg9DuQgpBrg5BTQg4BShKA8QhIA6hcAmQhbAihxARIjyAUQlEgah4gtgAh7tgQgwAngYBrQgZBngHCwIAAN5QAHCwAZBpQAYBpAwAoQAtApBOAAQBNAAAvgpQAwgoAYhpQAXhpAHiwIAAt5QgHiwgXhnQgYhrgwgnQgvgqhNAAQhOAAgtAqg");
	this.shape.setTransform(95.1,137.8);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,190.1,275.5);


(lib.Letter4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s(1).p("AsEUyMAAAgpjIK3AAMAAAAgsINSAAIAAI3g");
	this.shape.setTransform(77.3,133);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,154.6,266);


(lib.Letter3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s(1).p("AsEUyMAAAgpjIK2AAMAAAAgsINTAAIAAI3g");
	this.shape.setTransform(77.3,133);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,154.6,266);


(lib.Letter2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s(1).p("AskUyMAAAgpjIYmAAIAAI3ItvAAIAAHGIM4AAIAAIfIs4AAIAAIQIOSAAIAAI3g");
	this.shape.setTransform(80.5,133);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,161,266);


(lib.Letter1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s(1).p("ADWUyIAAxHImnAAIAARHIq3AAMAAAgpjIK3AAIAAPQIGnAAIAAvQIKyAAMAAAApjg");
	this.shape.setTransform(90.5,133);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,181,266);


(lib.Hello = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Letter4
	this.letter4 = new lib.Letter4();
	this.letter4.setTransform(649.6,137.8,1,1,0,0,0,77.3,133);

	this.timeline.addTween(cjs.Tween.get(this.letter4).wait(1));

	// Letter3
	this.letter3 = new lib.Letter3();
	this.letter3.setTransform(477.4,137.8,1,1,0,0,0,77.3,133);

	this.timeline.addTween(cjs.Tween.get(this.letter3).wait(1));

	// Letter2
	this.letter2 = new lib.Letter2();
	this.letter2.setTransform(294.3,137.8,1,1,0,0,0,80.5,133);

	this.timeline.addTween(cjs.Tween.get(this.letter2).wait(1));

	// Letter1
	this.letter1 = new lib.Letter1();
	this.letter1.setTransform(90.5,137.8,1,1,0,0,0,90.5,133);

	this.timeline.addTween(cjs.Tween.get(this.letter1).wait(1));

	// letter5
	this.letter5 = new lib.Letter5();
	this.letter5.setTransform(831.8,137.8,1,1,0,0,0,95,137.8);

	this.timeline.addTween(cjs.Tween.get(this.letter5).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,926.9,275.5);


// stage content:
(lib.Text3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.hello = new lib.Hello();
	this.hello.setTransform(46.3,156);

	this.timeline.addTween(cjs.Tween.get(this.hello).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(558.3,456,926.9,275.5);

})(lib = lib||{}, images = images||{}, createjs = createjs||{}, ss = ss||{});
var lib, images, createjs, ss;
