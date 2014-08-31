
    function Snake(x, y) {

    	this.imgR1 = 13;
    	this.imgR2 = 14;
    	this.imgL1 = 15;
    	this.imgL2 = 16;

        this.rightFrames = [this.imgR1, this.imgR2];
        this.leftFrames = [this.imgL1, this.imgL2];
        
        this.frames = this.rightFrames;
        this.frameRate = 1000;
        this.currentFrame = 0;

        if (x && y) {
        	this.position = { 'x' : x, 'y' : y };	
        } else {
        	this.position = { 'x' : 0, 'y' : 0 };
        }
        
        this.standardHeight = 40;
        this.standardWidth = 40;
        this.timer = 0;
    	this.movementDelta = 0;
    	this.savedImg = null;
        this.direction = RIGHT;
        this.speed = 0.05;
        
    }

    Snake.prototype.moveLeft = function() {
    	this.direction = LEFT;
    	this.img = window.ImgCache[this.imgL1];
    }

    Snake.prototype.moveRight = function() {
    	this.direction = RIGHT;
    	this.img = window.ImgCache[this.imgR1];
    }

    Snake.prototype.update = function(elapsed) {
    	
       	var movement = elapsed * this.speed;

        var nextPos = { 'x': this.position.x, 'y': this.position.y };
            
        if (this.direction == UP) {
        	nextPos.y -= movement;
        } else if (this.direction == DOWN) {
        	nextPos.y += movement;
        } else if (this.direction == LEFT) {
        	nextPos.x -= movement;
        } else {
        	nextPos.x += movement;
        }
        	
        	
        var offTheSide = (nextPos.x > worldWidth || nextPos.x < 0);
        var whatnot = world.collideWith(this.getCollisionBox(nextPos.x, nextPos.y));
        if (whatnot || offTheSide) {

        	// debug output - collision
        	if (debug) {
        		console.debug("snake collision!");
        	}

        	if (this.direction == RIGHT) {
        		this.direction = LEFT;
        		this.frames = this.leftFrames;
        	} else {
        		this.direction = RIGHT;
        		this.frames = this.rightFrames;
        	}

        } else {

        	// debug output - snake grid location
        	if (debug) {
        		var gridX = Math.round((nextPos.x + (this.frames[this.currentFrame].width / 2)) / world.tileWidth) - 1; 
        		var gridY = Math.round((nextPos.y + (this.frames[this.currentFrame].height / 2)) / world.tileHeight) - 1;
        		console.debug("snake at grid position " + gridX + ", " + gridY);
        	}

        	this.position.x = nextPos.x;
        	this.position.y = nextPos.y;

        }
        	
        this.movementDelta += movement;

        this.timer += elapsed;
        if (this.timer > this.frameRate) {
        	this.timer -= this.frameRate;
        	this.currentFrame++;
        	if (this.currentFrame == this.frames.length) {
        		this.currentFrame = 0;
        	}
        }
        
        this.img = window.ImgCache[this.frames[this.currentFrame]];
    	
    }

    Snake.prototype.bottom = function() {
    	return this.position.y - (this.img.height / 2);
    }

    Snake.prototype.getCollisionBox = function(x, y) {
    	
    	return new Box(new Point(x + 0, y + 10), 30, 15);
    	
    }
    
    Snake.prototype.draw = function(ctx) {

        ctx.save();
        ctx.translate((this.position.x),(this.position.y));
        ctx.drawImage(this.img,-(this.img.width/2),-(this.img.height/2));
        ctx.restore();
        
    }
