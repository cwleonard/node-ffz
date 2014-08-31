
    function Point(px, py) {
    	
    	this.x = px;
    	this.y = py;
    	
    }

    function Box(p, w, h) {
    	
    	this.center = p;
    	this.width = w;
    	this.height = h;
    	
    	var topLeft = new Point(p.x - (this.width / 2), p.y - (this.height / 2));
    	var topRight = new Point(p.x + (this.width / 2), p.y - (this.height / 2));
    	var botLeft = new Point(p.x - (this.width / 2), p.y + (this.height / 2));
    	var botRight = new Point(p.x + (this.width / 2), p.y + (this.height / 2));
    	
    	this.poly = new Polygon(this.center, "red");
    	this.poly.addPoint(topLeft);
    	this.poly.addPoint(topRight);
    	this.poly.addPoint(botRight);
    	this.poly.addPoint(botLeft);
    	
    }
    
    Box.prototype.intersectsWith = function(otherBox) {
    	
    	return this.poly.intersectsWith(otherBox.poly);
    	
    }