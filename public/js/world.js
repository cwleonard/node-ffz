
    function World() {

    	this.tileWidth = 40;
    	this.tileHeight = 40;
    	
        this.position = { 'x' : 0, 'y' : 0 };
        this.matrix = null;
        this.objects = null;
        
        this.weather = "Clear";
        this.clouds = [];
        this.rain = [];
        this.thunderstorm = false;
        
        
    }
    
    World.prototype.getGridWidth = function() {
    	return this.matrix[0].length;
    }
    
    World.prototype.getGridHeight = function() {
    	return this.matrix.length;
    }
    
    World.prototype.getWidth = function() {
    	return this.matrix[0].length * this.tileWidth;
    }
    
    World.prototype.getHeight = function() {
    	return this.matrix.length * this.tileHeight;
    }
    

    World.prototype.update = function(elapsed) {

    	if (this.clouds.length > 0) {
    		
    		for (var i = 0; i < this.clouds.length; i++) {
    			this.clouds[i].center.x += elapsed * 0.02;
    			this.clouds[i].center.y += elapsed * 0.01;
    			if (this.clouds[i].center.y > this.getHeight()) {
    				this.clouds[i].center.y -= this.getHeight() + this.clouds[i].radius;
    				this.clouds[i].center.x = Math.floor((Math.random()*(this.getWidth()*2))) - this.getWidth();
    			}
    		}
    		
    	}
    	
    	if (this.rain.length > 0) {
    		
    		for (var i = 0; i < this.rain.length; i++) {
    			this.rain[i].y += elapsed * 0.15;
    			if (this.rain[i].y > this.getHeight()) {
    				this.rain[i].y -= this.getHeight() + 50;
    			}
    		}
    		
    	}
    	
    	
    	/*
    	if (frog.moving) {
        	var movement = elapsed * this.speed;
        	if (this.direction == UP) {
        		this.position.y -= movement;
        	} else if (this.direction == DOWN) {
        		this.position.y += movement;
        	} else if (this.direction == LEFT) {
        		this.position.x -= movement;
        	} else {
        		this.position.x += movement;
        	}
    		
    	}
    	*/
    	
    	//frog.update(elapsed);
    	
    }
    
    World.prototype.collideWith = function(fb, dx, dy, s2) {
    	
    	var gridX = Math.round((fb.center.x + (fb.width / 2)) / world.tileWidth) - 1; 
    	var gridY = Math.round((fb.center.y + (fb.height / 2)) / world.tileHeight) - 1;
    	
    	for (var p in sprites) {
    		var s = sprites[p];
    		if (s != s2 && s.obj && s.obj.blocking) {
    			var c = new Point(s.position.x, s.position.y);
    			var b = new Box(c, s.obj.boxwidth, s.obj.boxheight);
    			var intersection = fb.intersectsWith(b);
    			if (intersection) {
    				if (s2) {
    					return intersection;
    				} else if (s.canMove(dx, dy)) {
    					s.moveBy(intersection.axis.x * intersection.overlap, intersection.axis.y * intersection.overlap);
    					//s.position.x += intersection.axis.x * intersection.overlap;
    					//s.position.y += intersection.axis.y * intersection.overlap;
    				} else {
    					return intersection;
    				}
    			}
    		}
    	}
    	
    	for (var i = gridY - 1; i <= gridY + 1; i++) {
    		for (var j = gridX - 1; j <= gridX + 1; j++) {
//    			if (this.objects[i]) {
//    				var o = this.objects[i][j];
//    				if (o != null && o.boxcenter && o.blocking) {
//    					var c = new Point(((j*world.tileWidth) + (this.tileWidth / 2)), ((i*world.tileHeight) + (this.tileHeight / 2)));
//    					var b = new Box(c, o.boxwidth, o.boxheight);
//    					var intersection = fb.intersectsWith(b);
//    					if (intersection) {
//    						return intersection;
//    					}
//    				}
//    			}
    			if (this.matrix[i] && this.matrix[i][j] && TileImgCache[this.matrix[i][j].id].block) {
    				var p = TileImgCache[this.matrix[i][j].id].block;
    				var rp = new Polygon({x: p.center.x, y: p.center.y});
    				rp.points = p.points;
    				rp.shiftCenter((j * world.tileWidth), (i * world.tileHeight));
					var intersection = fb.poly.intersectsWith(rp);
   					if (intersection) {
   						return intersection;
   					}
    			}
    		}
    	}
    	return false;
    	
    }
    
    World.prototype.isWaterAt = function(x, y) {
    	
    	if (this.matrix[y] && this.matrix[y][x] && TileImgCache[this.matrix[y][x].id].water) {
    		return true;
    	} else {
    		return false;
    	}
    	
    }
    
    World.prototype.draw = function(ctx) {

    	ctx.translate(viewport.x,viewport.y);
    	
        ctx.save();

        var startTileX = Math.floor(Math.abs(viewport.x) / this.tileWidth);
        var stopTileX = Math.floor(startTileX + Math.ceil(canvas.width / this.tileWidth)) + 1;

        var startTileY = Math.floor(Math.abs(viewport.y) / this.tileHeight);
        var stopTileY = Math.floor(startTileY + Math.ceil(canvas.height / this.tileHeight)) + 1;

        if (startTileX < 0) startTileX = 0;
        if (stopTileX > this.matrix[0].length) stopTileX = this.matrix[0].length;

        if (startTileY < 0) startTileY = 0;
        if (stopTileY > this.matrix.length) stopTileY = this.matrix.length;

        ctx.translate(-this.tileWidth,startTileY * this.tileHeight);
        for (var i = startTileY; i < stopTileY; i++) {
       		ctx.translate(this.tileWidth * startTileX, 0);
        	for (var j = startTileX; j < stopTileX; j++) {
        		ctx.translate(this.tileWidth, 0);
        		ctx.drawImage(TileImgCache[this.matrix[i][j].id],0,0);
        		// draw the "blocking" polygon if in debug mode
        		if (debug && TileImgCache[this.matrix[i][j].id].block) {
        			var p = TileImgCache[this.matrix[i][j].id].block;
    				var rp = new Polygon({x: p.center.x, y: p.center.y}, "red");
    				rp.points = p.points;
    				rp.shiftCenter((j * world.tileWidth), (i * world.tileHeight));
    				rp.draw(ctx);
        		}
        	}
            ctx.translate(-(this.tileWidth * stopTileX), this.tileHeight);
        }

        ctx.restore();

        this.unifiedDraw(sprites, ctx);
        
        this.drawWeather(ctx);
        
        /*
        
        for (var e = 0; e < sprites.length; e++) {
            sprites[e].draw(ctx);
        }

        if (frog) {
        	//var rowsBeforeFrog = Math.round((frog.position.y + (frog.img.height / 2)) / this.tileHeight);
        	var rowsBeforeFrog = Math.round((frog.position.y + (frog.standardHeight / 2)) / this.tileHeight);
        	this.drawStuff(0, rowsBeforeFrog-1, ctx);
        	this.drawStuffOnFrogRow(rowsBeforeFrog-1, ctx);
        	//frog.draw(ctx);
        	this.drawStuff(rowsBeforeFrog, this.objects.length, ctx);
        } else {
        	this.drawStuff(0, this.objects.length, ctx);
        }
        
        */
        
    }
    
    World.prototype.doThunder = function() {
    	if (this.thunderstorm && thunderSound && thunderSound.readyState == 3) {
    		thunderSound.play();
    		var w = this;
    		setTimeout(function() {w.doThunder();}, Math.floor((Math.random()*10000)+15000));
    	}
    }
    
    function playRainSound() {
    	if (rainSound && rainSound.readyState == 3) {
    		rainSound.play();
    	}
    }
    
    World.prototype.drawWeather = function(ctx) {

        ctx.save();

        if (this.weather.indexOf("Rain") == -1 && this.weather.indexOf("Thunderstorm") == -1) {
        	if (rainSound) {
        		this.rain = [];
        		rainSound.stop();
        	}
        } else {
			if (rainSound && rainSound.playState == 0) {
				playRainSound();
			}
        }
        
        if (this.weather.indexOf("Thunderstorm") != -1) {
        	this.thunderstorm = true;
        } else {
        	this.thunderstorm = false;
        }
        
    	if (this.weather == "Overcast") {
    		
    		this.clouds = [];
    		
    		// shade the whole area
    		var cx = -viewport.x + (canvas.width/2);
    		var cy = -viewport.y + (canvas.height/2);
    		var cloud = new Box({x: cx, y: cy}, canvas.width, canvas.height, "black");
    		ctx.globalAlpha=0.1;
    		cloud.poly.draw(ctx);
    		ctx.globalAlpha=1.0;
    		
    	} else if (this.weather == "Mostly Cloudy") {

    		var x_upper = this.getWidth();
    		var y_upper = this.getHeight();

    		if (this.clouds.length == 0) {
    			// make new clouds
    			for (var i = 0; i < 8; i++) {
    				var xx = Math.floor((Math.random()*(x_upper*2))) - x_upper;//Math.floor((Math.random()*x_upper));
    				var yy = Math.floor((Math.random()*y_upper));
    			    var r = Math.floor((Math.random()*25)+50);
    			    var c = new Circle({x:xx,y:yy}, r, 1.75, 1, "black");
    			    this.clouds.push(c);
    			}
    		}
    		
    		for (var i = 0; i < this.clouds.length; i++) {
        		ctx.globalAlpha=0.1;
    			this.clouds[i].draw(ctx);
        		ctx.globalAlpha=1.0;
    		}
    		
    	} else if (this.weather.indexOf("Rain") != -1 || this.weather.indexOf("Thunderstorm") != -1) {

    		this.clouds = [];

    		// shade the whole area
    		var cx = -viewport.x + (canvas.width/2);
    		var cy = -viewport.y + (canvas.height/2);
    		var cloud = new Box({x: cx, y: cy}, canvas.width, canvas.height, "black");
    		ctx.globalAlpha=0.25;
    		cloud.poly.draw(ctx);
    		ctx.globalAlpha=1.0;

    		if (this.rain.length == 0) {
    			
    			for (var i = 0; i < 30; i++) {
    				var r = {
    						x: Math.floor((Math.random()*(this.getWidth()+150))-150),
    						y: Math.floor((Math.random()*this.getHeight())-50),
    						draw: function(ctx2) {
    							ctx2.save();
    							ctx2.translate(this.x, this.y);
    							ctx2.drawImage(window.ImgCache[82],0,0);
    							ctx2.restore();
    						}
    				}
    				this.rain.push(r);
    			}
    			if (this.weather.indexOf("Thunder") != -1) {
    			    this.doThunder();
    			}
    		
    		}
    		
    		for (var i = 0; i < this.rain.length; i++) {
    			this.rain[i].draw(ctx);
    		}
    		
    	}
    	
    	ctx.restore();
    	
    }
    
    World.prototype.drawStuffOnFrogRow = function(row, ctx) {

    	var drawAfterFrog = new Array();
    	var innerArray = this.objects[row];
    	if (innerArray != null) {
    		for (var j = 0; j < innerArray.length; j++) {
    			var o = innerArray[j];
    			if (o != null) {
    				var px = (j * this.tileWidth) + (this.tileWidth / 2);
    				var py = (row * this.tileHeight) + (this.tileHeight / 2);
    				var offsetY = 0;
    				if (o.boxheight) {
    					offsetY = o.boxheight / 2;
    				}
    				if (o.heightOffset) {
    					py += o.heightOffset;
    				}
    				if (o.widthOffset) {
    					px += o.widthOffset;
    				}
  				    if (py + offsetY >= frog.position.y + (frog.standardHeight/2)) {
                   	    drawAfterFrog.push( { "obj":o, "x":px, "y":py } );
                    } else {
        				ctx.save();
        				ctx.translate(px, py);
    	    			if (o.boxcenter) {
    	    				if (debug) {
    		    			    var box = new Box(new Point(0, 0), o.boxwidth, o.boxheight);
    			    		    box.poly.draw(ctx);
    			                ctx.globalAlpha=0.5;
    	    				}
    					    ctx.drawImage(ImgCache[o.imgid], -o.boxcenter.x, -o.boxcenter.y);
        			        if (debug) {
        			        	ctx.globalAlpha=1.0;
        			        }
        				} else {
        					var img = ImgCache[o.imgid];
        					ctx.drawImage(img, -(img.width/2), -img.height);
    		    		}
    			    	ctx.restore();
                    }
    			}
    		}
    	}
    	
    	frog.draw(ctx);
    	
    	for (var i = 0; i < drawAfterFrog.length; i++) {
    	    var o = drawAfterFrog[i].obj;
    	    var px = drawAfterFrog[i].x;
    	    var py = drawAfterFrog[i].y;
			ctx.save();
			ctx.translate(px, py);
			if (o.boxcenter) {
				if (debug) {
    			    var box = new Box(new Point(0, 0), o.boxwidth, o.boxheight);
	    		    box.poly.draw(ctx);
	                ctx.globalAlpha=0.5;
				}
			    ctx.drawImage(ImgCache[o.imgid], -o.boxcenter.x, -o.boxcenter.y);
		        if (debug) {
		        	ctx.globalAlpha=1.0;
		        }
			} else {
				var img = ImgCache[o.imgid];
				ctx.drawImage(img, -(img.width/2), -img.height);
    		}
	    	ctx.restore();
    	}
    	
    	
    	
    	
    }
    
    World.prototype.drawStuff = function(start, end, ctx) {
    	
        for (var i = start; i < end; i++) {
        	var innerArray = this.objects[i];
        	if (innerArray != null) {
        		for (var j = 0; j < innerArray.length; j++) {
        			var o = innerArray[j];
        			if (o != null) {
        				var px = (j * this.tileWidth) + (this.tileWidth / 2);
        				var py = (i * this.tileHeight) + (this.tileHeight / 2);
        				if (o.heightOffset) {
        					py += o.heightOffset;
        				}
        				if (o.widthOffset) {
        					px += o.widthOffset;
        				}
        				ctx.save();
        				ctx.translate(px, py);
        				if (o.boxcenter) {
        					if (debug) {
        					    var box = new Box(new Point(0, 0), o.boxwidth, o.boxheight);
        					    box.poly.draw(ctx);
        			            ctx.globalAlpha=0.5;
        					}
        					ctx.drawImage(ImgCache[o.imgid], -o.boxcenter.x, -o.boxcenter.y);
        					if (debug) {
        						ctx.globalAlpha=1.0;
        					}
        				} else {
        					var img = ImgCache[o.imgid];
        					ctx.drawImage(img, -(img.width/2), -img.height);
        				}
        				ctx.restore();
        			}
        		}
        	}
        }
    	
    }
    
    World.prototype.unifiedDraw = function(stuff, ctx) {
    	
    	sprites = spriteSort(stuff);
    	
    	for (var i = 0; i < stuff.length; i++) {
    		stuff[i].draw(ctx);
    	}
    	
    }

    // ====================
    
    function Rain() {
    	this.x = 0;
    	this.y = 0;
    }
    
    Rain.prototype.draw = function(ctx) {
    	
    	ctx.save();
    	ctx.transform(this.x, this.y);
    	ctx.drawImage(window.ImgCache[82],0,0);
    	ctx.restore();
    	
    }
    
    
    // =====================
    
    /**
     * sort an array of sprites.
     */
    function spriteSort(arr) {
    	
        if (arr.length < 2)
            return arr;
     
        var middle = parseInt(arr.length / 2);
        var left   = arr.slice(0, middle);
        var right  = arr.slice(middle, arr.length);
     
        return spriteMerge(spriteSort(left), spriteSort(right));
    	
    }
    
    function spriteMerge(left, right) {
    	
        var result = [];
        
        while (left.length && right.length) {
            //if (left[0].position.y <= right[0].position.y) {
        	if (left[0].bottom() <= right[0].bottom()) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }
     
        while (left.length)
            result.push(left.shift());
     
        while (right.length)
            result.push(right.shift());
     
        return result;
    	
    }
    
    