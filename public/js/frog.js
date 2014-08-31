
    var UP = 0;
    var DOWN = 1;
    var RIGHT = 2;
    var LEFT = 3;

    function Frog() {

    	this.SIT_N = 0;
    	this.SIT_S = 1;
    	this.SIT_E = 2;
    	this.SIT_W = 3;

    	this.JUMP_N = 4;
    	this.JUMP_S = 5;
    	this.JUMP_E = 6;
    	this.JUMP_W = 7;

    	this.WATER_N = 8;
    	this.WATER_S = 9;
    	this.WATER_E = 10;
    	this.WATER_W = 11;

    	this.SWIM_N = 12;
    	this.SWIM_S = 13;
    	this.SWIM_E = 14;
    	this.SWIM_W = 15;
    	
    	this.RIBBIT_N = 16;
    	this.RIBBIT_S = 17;
    	this.RIBBIT_E = 18;
    	this.RIBBIT_W = 19;
    	
    	this.uid = Math.floor(Math.random()*10000);
    	
    	this.imgSU = 17;
    	this.imgSD = 18;
    	this.imgSR = 19;
    	this.imgSL = 20;

    	this.imgJU = 21;
    	this.imgJD = 22;
    	this.imgJR = 23;
    	this.imgJL = 24;

    	this.imgWU = 25;
    	this.imgWD = 27;
    	this.imgWR = 29;
    	this.imgWL = 31;
        
    	this.imgWU2 = 26;
    	this.imgWD2 = 28;
    	this.imgWR2 = 30;
    	this.imgWL2 = 32;

    	this.imgRD = 35;
    	this.imgRR = 33;
    	this.imgRL = 34;
        
        this.images = [this.imgSU, this.imgSD, this.imgSR, this.imgSL,
                       this.imgJU, this.imgJD, this.imgJR, this.imgJL,
                       this.imgWU, this.imgWD, this.imgWR, this.imgWL,
                       this.imgWU2, this.imgWD2, this.imgWR2, this.imgWL2,
                       this.imgSU, this.imgRD, this.imgRR, this.imgRL
                      ];
        

        this.standardHeight = 40;
        this.standardWidth = 40;
        this.timer = 0;
    	this.movementDelta = 0;
    	this.resting = false;
        this.imgId = this.SIT_E;
        this.savedImgId = -1;
        this.position = { 'x' : 0, 'y' : 0 };
        this.moving = false;
        this.direction = RIGHT;
        //this.speed = 0.08;
        this.inWater = false;
        this.ribbiting = false;
        this.temperature = 80;
        this.tempSpeedConst = 0.0013333;
        
        this.intervalId = 0;
        this.setIntervalForStanding();
        
    }
    
    Frog.prototype.setIntervalForMoving = function() {
    	if (this.intervalId > 0) {
    		clearInterval(this.intervalId);
    	}
        var self = this;
        this.intervalId = setInterval(function() {
        	self.trigger('move', self.getInfo());
        },50);
    }

    Frog.prototype.setIntervalForStanding = function() {
    	if (this.intervalId > 0) {
    		clearInterval(this.intervalId);
    	}
        var self = this;
        this.intervalId = setInterval(function() {
        	self.trigger('move', self.getInfo());
        },1000);
    }
    
    Frog.prototype.destroy = function() {
    	this.uid = -1;
    }

    Frog.prototype.bottom = function() {
    	//return this.position.y + 10 - (15 / 2);
    	return this.position.y + 10 + (this.getCollisionBox(0,0).height/2);
    }

    Frog.prototype.setImageByDirection = function(dir, type) {

    	if (!dir) dir = this.direction;
    	if (!type) {
    		type = 0;
    		if (this.inWater) {
    		    type = this.WATER_N;
    	    }
    		if (this.moving && !this.resting) {
    			type += 4;
    		}
    		if (!this.moving && !this.inWater && !this.resting && this.ribbiting) {
    			type = this.RIBBIT_N;
    		}
    	}
    	this.imgId = dir + type;
    	
    }
    
    Frog.prototype.getInfo = function() {
    	return {id: this.uid, imgId: this.imgId, pos: this.position, dir: this.direction};
    }
    
    Frog.prototype.stopMoving = function() {
    	this.moving = false;
    	this.resting = false;
    	this.movementDelta = 0;
    	this.setImageByDirection();
        this.setIntervalForStanding();
    	this.trigger('move', this.getInfo());
    }
    
    Frog.prototype.moveUp = function() {
    	this.moving = true;
    	this.direction = UP;
    	this.setImageByDirection();
        this.setIntervalForMoving();
    	this.trigger('move', this.getInfo());
    }

    Frog.prototype.moveDown = function() {
    	this.moving = true;
    	this.direction = DOWN;
    	this.setImageByDirection();
        this.setIntervalForMoving();
    	this.trigger('move', this.getInfo());
    }

    Frog.prototype.moveLeft = function() {
    	this.moving = true;
    	this.direction = LEFT;
    	this.setImageByDirection();
        this.setIntervalForMoving();
    	this.trigger('move', this.getInfo());
    }

    Frog.prototype.moveRight = function() {
    	this.moving = true;
    	this.direction = RIGHT;
    	this.setImageByDirection();
        this.setIntervalForMoving();
    	this.trigger('move', this.getInfo());
    }

    Frog.prototype.ribbit = function(sound) {
    	
    	this.ribbiting = true;
    	this.setImageByDirection();
    	var f = this;
    	sound.play({onfinish: function() {
    		f.ribbiting = false;
    		f.setImageByDirection();
    	}});
    	this.trigger('ribbit', this.getInfo());
    	
    }
    
    Frog.prototype.update = function(elapsed) {
    	
    	if (this.uid == -1) return;
    	if (this.inArea && currentArea && currentArea.id && this.inArea != currentArea.id) return;
    	
    	if (this.moving && !this.resting) {
    		
        	var movement = elapsed * (this.temperature * this.tempSpeedConst);
        	
            var nextPos = { 'x': this.position.x, 'y': this.position.y };
            
            var dx = 0;
            var dy = 0;
        	if (this.direction == UP) {
        		nextPos.y -= movement;
        		dy -= movement;
        	} else if (this.direction == DOWN) {
        		nextPos.y += movement;
        		dy += movement;
        	} else if (this.direction == LEFT) {
        		nextPos.x -= movement;
        		dx -= movement;
        	} else {
        		nextPos.x += movement;
        		dx += movement;
        	}
        	
        	var gridX = Math.round((nextPos.x + (window.ImgCache[this.imgSL].width / 2)) / world.tileWidth) - 1; 
        	var gridY = Math.round((nextPos.y + (window.ImgCache[this.imgSL].height / 2)) / world.tileHeight) - 1;
        	
        	//var whatnot = world.collideWith(new Box(new Point(nextPos.x, nextPos.y+10), 20, 20));
        	var whatnot = world.collideWith(this.getCollisionBox(nextPos.x, nextPos.y), dx, dy);
        	if (whatnot) {
                
        		// debug output - collision
        		if (debug) {
        			console.debug("collision!");
        		}
                
                movement = 0;
                var diff = {x: whatnot.axis.x * whatnot.overlap, y: whatnot.axis.y * whatnot.overlap};
                var npx = nextPos.x - diff.x;
                var npy = nextPos.y - diff.y;
                
                //console.debug("moving x:%d, y:%d", this.position.x - npx, this.position.y - npy);
                
                this.position.x = nextPos.x - diff.x;
                this.position.y = nextPos.y - diff.y;
                
                
        	} else {

        		// debug output - frog grid location
        		if (debug) {
        			console.debug("frog at grid position " + gridX + ", " + gridY);
        		}
        		
                this.position.x = nextPos.x;
            	this.position.y = nextPos.y;
            	
        	}
        	
        	
            var wtr = world.isWaterAt(gridX, gridY);
            if (wtr && !this.inWater) {
            	try {
            		splashSound.play();
            	} catch (e) {
            		// ignore
            	}
            }
        	this.inWater = wtr;
        	
    		this.movementDelta += movement;
    		if (this.movementDelta > 40) {
    			this.movementDelta = 0;
    			this.resting = true;
    			this.timer = 0;
    			this.savedImgId = this.imgId;
    		}

    		this.setImageByDirection();

    	} else if (this.resting) {
    		this.timer += elapsed;
    		if (this.timer >= 500) {
    			this.resting = false;
    			this.imgId = this.savedImgId;
    			this.timer = 0;
    		}
    	}


    }
    
    Frog.prototype.getCollisionBox = function(x, y) {
    	
    	return new Box(new Point(x + 0, y + 10), 30, 15);
    	
    }
    
    Frog.prototype.draw = function(ctx) {

    	if (this.uid == -1) return;
    	if (this.inArea && currentArea && currentArea.id && this.inArea != currentArea.id) return;

        var iid = this.images[this.imgId];

        ctx.save();
        ctx.translate((this.position.x),(this.position.y));

        // draw shadow
        ctx.save();
        var sx = -0.5;
        var scale = 0.5;
        var shimg = window.ShadowCache[iid];
        //ctx.translate(0, window.ImgCache[iid].height*(1.0-scale));
        ctx.scale(1, scale);
        ctx.transform(1, 0, sx, 1, 0, 0);
        //ctx.drawImage(shimg, -(window.ImgCache[iid].height*sx), 0);
        ctx.drawImage(shimg, 0, 0);
        ctx.restore();
        // end shadow drawing
        
        ctx.save();
        if (debug)  {
        	var fb = this.getCollisionBox(0, 0);
            fb.poly.draw(ctx);
            ctx.globalAlpha=0.5;
        }
        ctx.drawImage(window.ImgCache[iid],-(window.ImgCache[iid].width/2),-(window.ImgCache[iid].height/2));
        if (debug) {
        	ctx.globalAlpha=1.0;
        }
        ctx.restore();

        ctx.restore();

        
    }
    
    MicroEvent.mixin(Frog);

