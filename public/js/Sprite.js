

function Sprite(o, row, col) {
	
	this.id = 0;
	this.obj = null;
	this.position = { 'x' : 0, 'y' : 0 };
	this.offsetY = 0;
	this.moveable = false;
	
	if (o) {
		
		this.obj = o;
		
		if (this.obj.description == "Rock") {
			this.moveable = true;
		}

		var px = (col * world.tileWidth) + (world.tileWidth / 2);
		var py = (row * world.tileHeight) + (world.tileHeight / 2);

		if (this.obj.boxheight) {
			this.offsetY = this.obj.boxheight / 2;
		}
		if (this.obj.heightOffset) {
			py += this.obj.heightOffset;
		}
		if (this.obj.widthOffset) {
			px += this.obj.widthOffset;
		}
		
		this.position.x = px;
		this.position.y = py;

	}
	
}

Sprite.prototype.moveBy = function(dx, dy) {
	
	this.position.x += dx;
	this.position.y += dy;
	this.trigger('move', {'objid':this.id, 'position':this.position});
	
}

Sprite.prototype.canMove = function(dx, dy) {
	
	if (this.moveable) {
		
    	return !world.collideWith(this.getCollisionBox(this.position.x + dx, this.position.y + dy), dx, dy, this);
		
	} else {
		return false;
	}
	
}


Sprite.prototype.update = function(elapsed) {
	
	
	
}

Sprite.prototype.getCollisionBox = function(x, y) {
	
	return new Box(new Point(x, y), this.obj.boxwidth, this.obj.boxheight);
	
}

Sprite.prototype.bottom = function() {
	
	return (this.position.y + (this.getCollisionBox().height/2));
	
//    if (this.obj.boxheight != 0) {
//        return this.position.y - (this.obj.boxheight / 2);
//    } else {
//    	var img = ImgCache[this.obj.imgid];
//        var b = this.position.y - (img.height / 2);
//        if (this.obj.heightOffset) {
//            b += this.obj.heightOffset;
//        }
//        return b;
//    }
	
}


Sprite.prototype.draw = function(ctx) {
	
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    
    // draw shadow
//    ctx.save();
//    var sx = -0.5;
//    var scale = 0.5;
//    var shimg = window.ShadowCache[this.obj.imgid];
//    ctx.translate(0, window.ImgCache[iid].height*(1.0-scale));
//    ctx.scale(1, scale);
//    ctx.transform(1, 0, sx, 1, 0, 0);
//    ctx.drawImage(shimg, -(window.ImgCache[iid].height*sx), 0);
//    ctx.drawImage(shimg, 0, 0);
//    ctx.restore();
    // end shadow drawing

    ctx.save();
    if (this.obj.boxcenter) {
        if (debug) {
            var box = this.getCollisionBox(0, 0);
            box.poly.draw(ctx);
            ctx.globalAlpha=0.5;
        }
        ctx.drawImage(ImgCache[this.obj.imgid], -this.obj.boxcenter.x, -this.obj.boxcenter.y);
        if (debug) {
            ctx.globalAlpha=1.0;
        }
    } else {
        var img = ImgCache[this.obj.imgid];
        ctx.drawImage(img, -(img.width/2), -img.height);
    }
    ctx.restore();
    
    ctx.restore();
	
}

MicroEvent.mixin(Sprite);
