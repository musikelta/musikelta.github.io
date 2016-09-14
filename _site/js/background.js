
Math.m = Math.pow(2,32);
Math.c = 1013904223;
Math.a = 1664525;
Math.seed = Math.random()*Math.c;
Math.initialSeed = Math.seed;
Math.seededRandom = function(){
  Math.seed = (Math.a * Math.seed + Math.c) % Math.m;
  return Math.seed/Math.m;
}

var VMath = {};
VMath.up = {x:0,y:1};
VMath.down = {x:0,y:-1};
VMath.left = {x:-1,y:0};
VMath.right = {x:1,y:0};
VMath.length = function(v){
	return Math.sqrt(v.x * v.x + v.y * v.y);
}
VMath.distance = function(v1,v2){
	return VMath.length(VMath.subtract(v2,v1));
}
VMath.subtract = function(v1,v2){
	return {x: v1.x-v2.x, y: v1.y-v2.y};
}
VMath.add = function(v1,v2){
	return {x: v1.x+v2.x, y: v1.y+v2.y};
}
VMath.multiply = function(v1,v2){
	if(v2 instanceof Object){
		return {x: v1.x*v2.x, y: v1.y*v2.y};
	}else{
		return {x: v1.x*v2, y:v1.y*v2};
	}
}
VMath.divide = function(v1,v2){
	if(v2 instanceof Object){
		return {x: v1.x/v2.x, y: v1.y/v2.y};
	}else{
		return {x: v1.x/v2, y:v1.y/v2};
	}
}
VMath.unit = function(v){
	return VMath.divide(v, VMath.length(v));
}
VMath.lerp = function(v1,v2,alpha){
	VMath.add(v1,VMath.multiply(VMath.subtract(v2,v1),alpha));
}
VMath.dot = function(v1,v2){
	return v1.x * v2.x + v1.y * v2.y;
}
VMath.rotate = function(v,a){
	var cos = Math.cos(a);
	var sin = Math.sin(a);
	return {x:v.x * cos - v.y * sin, y:v.x * sin + v.y * cos};
}
VMath.perpendicular = function(v){
	return {x:v.y, y:-v.x};
}

var Faery = function(){
	this.sprite = PIXI.Sprite.fromImage('/img/sprite.png');
	this.velocity = {x:0, y:0};
	this.waypoint = {x:0, y:0};
	this.speed = 3;
	this.dampingFactor = 0.99;

	this.init = function(){
		this.sprite.anchor.x = 0.5;
		this.sprite.anchor.y = 0.5;
	}

	this.waypointReached = function(){};

	this.update = function(delta){
		var directionToTarget = VMath.unit(VMath.subtract(this.waypoint, this.sprite.position));
		this.velocity = VMath.multiply(VMath.add(this.velocity,VMath.multiply(VMath.multiply(directionToTarget,this.speed),delta)),this.dampingFactor);
		this.sprite.position = VMath.add(this.sprite.position, this.velocity);
		var newDirectionToTarget = VMath.unit(VMath.subtract(this.waypoint, this.sprite.position));
		var dot = VMath.dot(VMath.unit(directionToTarget),VMath.unit(newDirectionToTarget));
		if(dot < 0.98){
			this.waypointReached();
		}
	}

	this.init();
};

var Tree = function(){
	this.graphics = new PIXI.Graphics();
	this.graphics.cacheAsBitmap = true;
	this.base = {x:window.innerWidth/2, y:window.innerHeight};
	this.maxLength = 50;
	this.length = 100;
	this.levels = 8;
	this.maxLevels = 10;
	this.shrinkingFactor = 1.4;

  this.setPosition = function(){
    this.base = {x:window.innerWidth/2, y:window.innerHeight*0.9};
  }

	this.drawLeaf = function(position, height, offset){
		var endPosition = VMath.add(position, {x:offset,y:height});
		var halfHeight = height/2;
		var rightBottomControlPoint = VMath.add(position, {x:10,y:-halfHeight});
		var rightTopControlPoint = VMath.add(endPosition, {x:10,y:-halfHeight});
		var leftBottomControlPoint = VMath.add(position, {x:-10,y:-halfHeight});
		var leftTopControlPoint = VMath.add(endPosition, {x:-10,y:-halfHeight});
		this.graphics.moveTo(position.x, position.y);
		this.graphics.bezierCurveTo(	rightBottomControlPoint.x, rightBottomControlPoint.y,
																	rightTopControlPoint.x, rightTopControlPoint.y,
																	endPosition.x, endPosition.y);
		this.graphics.moveTo(position.x, position.y);
		this.graphics.bezierCurveTo(	leftBottomControlPoint.x, leftBottomControlPoint.y,
																	leftTopControlPoint.x, leftTopControlPoint.y,
																	endPosition.x, endPosition.y);
	}

	this.drawTree = function(position, width, length, angle, currentAngle, level, previousPerpendicular){
		var direction = VMath.rotate(VMath.down,currentAngle);
		var endPosition = VMath.add(position, VMath.multiply(direction,length));
		var shrunkWidth = width/this.shrinkingFactor;
		var perpendicular = VMath.perpendicular(direction);
		var p1 = VMath.add(position, VMath.multiply(previousPerpendicular, -width));
		var p2 = VMath.add(position, VMath.multiply(previousPerpendicular, width));
		this.graphics.moveTo(p1.x, p1.y);
		this.graphics.lineTo(p2.x, p2.y);
		var p3 = VMath.add(endPosition, VMath.multiply(perpendicular, shrunkWidth));
		var p4 = VMath.add(endPosition, VMath.multiply(perpendicular, -shrunkWidth));
		this.graphics.lineTo(p3.x, p3.y);
		this.graphics.lineTo(p4.x, p4.y);
		if(level > this.levels - 3){
			this.drawLeaf(endPosition, (Math.seededRandom()*0.5+0.5)*20, (Math.seededRandom()*2-1)*10);
			this.drawLeaf(VMath.add(position,VMath.multiply(direction, VMath.distance(position, endPosition)/2)),(Math.seededRandom()*0.5+0.5)*20, (Math.seededRandom()*2-1)*10);
		}
		if(level <= this.levels){
			var branchDrawn = false;
			if(Math.seededRandom()<0.95){
				branchDrawn = true;
				this.drawTree(endPosition, shrunkWidth, length*(Math.seededRandom()*0.1+0.8), Math.seededRandom()*0.6+0.2, currentAngle+angle, level+1, perpendicular);
			}
			if(!branchDrawn || Math.seededRandom()<0.99){
				this.drawTree(endPosition, shrunkWidth, length*(Math.seededRandom()*0.1+0.8), Math.seededRandom()*0.6+0.2, currentAngle-angle, level+1, perpendicular);
			}
			if(Math.seededRandom()>0.99){
				this.drawTree(endPosition, shrunkWidth, length*(Math.seededRandom()*0.1+0.8), Math.seededRandom()*0.6+0.2, currentAngle, level+1, perpendicular);
			}
		}
	}
	this.update = function(delta){
		this.graphics.x = this.base.x;
		this.graphics.y = this.base.y;
	}
	this.init = function(){
		this.graphics.beginFill(0);
		this.drawTree({x:0,y:0}, this.length/4, this.length, Math.seededRandom()*0.2+0.3, 0, 0, {x:-1,y:0});
		this.graphics.endFill();
    this.setPosition();
	}
	this.init();
}

var FaeryBackground = function(){
	var instance = this;
	var stage = new PIXI.Container();
	var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, null, false, true);
	var center = {x:window.innerWidth/2, y:window.innerHeight/2};
	var radius = 150;

	var startTime = undefined;
	var numberOfSprites = 12;
	var faeries = [];
	var tree = undefined;
	var background = {};
	var mousePosition = {x:window.innerWidth/2,y:window.innerHeight/2};

	function generateWaypoint(){
		if(Math.random()<0.9){
			var waypoint = {x:radius * (Math.random() * 2 - 1)+center.x, y:radius * (Math.random() * 2 - 1)+center.y};
		}else{
			var waypoint = mousePosition;
		}
		return waypoint;
	}

	function animate(timestamp){
		if(!startTime){
			startTime = timestamp;
		}
    var delta = timestamp - startTime;
    if(delta > 100){
      delta = 100;
    }
		if(delta > 10){
			var deltaS = (delta)/1000;
			startTime = timestamp;
			for(var i = 0; i < faeries.length; i++){
				faeries[i].update(deltaS);
			}
		}
		tree.update(deltaS);
		requestAnimationFrame(animate);
		renderer.render(stage);
	}

  function addFaeries(amount){
    for(var i = 0; i < amount; i++){
      var faery = new Faery();
      faery.waypoint = generateWaypoint();
      faery.sprite.position = generateWaypoint();
      faery.waypointReached = function(){
        this.waypoint = generateWaypoint();
      }
      faeries.push(faery);
      stage.addChild(faery.sprite);
    }
  }

	function init(){
		background = PIXI.Sprite.fromImage('/img/musikelta-bg.jpeg');
		background.width = renderer.width;
		background.height = renderer.height;
		stage.addChild(background);
    addFaeries(numberOfSprites*0.6);
		tree = new Tree();
		stage.addChild(tree.graphics);
    addFaeries(numberOfSprites*0.3);
    $(".background-container").append(renderer.view);
		//document.body.appendChild(renderer.view);
	}

	this.start = function(){
		requestAnimationFrame(animate);
	}

	this.resize = function(width, height){
		renderer.resize(width, height);
    center = {x:window.innerWidth/2, y:window.innerHeight/2};
    background.width = renderer.width;
		background.height = renderer.height;
    tree.setPosition();
	};

	this.mouseMove = function(position){
		mousePosition = position;
	}

	init();
};

var bg = new FaeryBackground();
bg.start();

$(window).resize(function() {
  document.body.style.overflow = "hidden";
	bg.resize($(window).width(), $(window).height());
  document.body.style.overflow = "";
});
$(window).mousemove(function(event){
	bg.mouseMove({x:event.pageX, y:event.pageY});
});
