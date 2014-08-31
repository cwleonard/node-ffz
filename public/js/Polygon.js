
    function Point(px, py) {
    	
    	this.x = px;
    	this.y = py;
    	
    }

    // ======================================================= BOX

    function Box(p, w, h, color) {
    	
    	this.center = p;
    	this.width = w;
    	this.height = h;
    	
    	var topLeft = new Point(0 - (this.width / 2), 0 - (this.height / 2));
    	var topRight = new Point(0 + (this.width / 2), 0 - (this.height / 2));
    	var botLeft = new Point(0 - (this.width / 2), 0 + (this.height / 2));
    	var botRight = new Point(0 + (this.width / 2), 0 + (this.height / 2));
    	
    	if (!color) {
    		color = "red";
    	}
    	
    	this.poly = new Polygon(this.center, color);
    	this.poly.addPoint(topLeft);
    	this.poly.addPoint(topRight);
    	this.poly.addPoint(botRight);
    	this.poly.addPoint(botLeft);
    	
    }
    
    Box.prototype.intersectsWith = function(otherBox) {
    	
    	return this.poly.intersectsWith(otherBox.poly);
    	
    }
    
    // ======================================================= OVAL
    
    function Circle(p, r, hs, vs, color) {
    	
    	this.center = p;
    	this.radius = r;
    	this.hscale = hs;
    	this.vscale = vs;
    	this.color = color;
    	
    	
    }
    
    Circle.prototype.draw = function(ctx) {
    	
		ctx.save();
		ctx.fillStyle = this.color;
        ctx.translate(this.center.x, this.center.y);
        ctx.beginPath();
        ctx.scale(this.hscale, this.vscale);
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.PI*2, false);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
    	
    }
    
    // ======================================================= POLYGON
    
    function Polygon(c, clr) {

    	this.points = new Array();
    	this.center = c;
    	this.color = clr;
    	
    }
    
    /**
     * i dont think this uses center-relative points
     */
    Polygon.prototype.area = function() {

    	var area=0;
    	var pts = this.points;
    	var nPts = pts.length;
    	var j=nPts-1;
    	var p1; var p2;

    	for (var i=0;i<nPts;j=i++) {
    	    p1=pts[i]; p2=pts[j];
    	    area+=p1.x*p2.y;
    	    area-=p1.y*p2.x;
    	}
    	area/=2;
    	return area;
    	
    }
    
    /**
    * i dont think this uses center-relative points
    */
    Polygon.prototype.centroid = function() {
    	
    	var pts = this.points;
    	var nPts = pts.length;
    	var x=0; var y=0;
    	var f;
    	var j=nPts-1;
    	var p1; var p2;

    	for (var i=0;i<nPts;j=i++) {
    		p1=pts[i]; p2=pts[j];
    		f=p1.x*p2.y-p2.x*p1.y;
    		x+=(p1.x+p2.x)*f;
    		y+=(p1.y+p2.y)*f;
    	}

    	f=this.area()*6;
    	return new Point(x/f,y/f);
    	
    }
    
    Polygon.prototype.shiftCenter = function(deltaX, deltaY) {
    	this.center.x += deltaX;
    	this.center.y += deltaY;
    }
    
    Polygon.prototype.addPoint = function(p) {
    	this.points.push(p);
    }
    
    Polygon.prototype.getNumberOfSides = function() {
    	return this.points.length;
    }
    
    Polygon.prototype.draw = function(ctx) {

        ctx.save();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x + this.center.x, this.points[0].y + this.center.y);
        for (var i = 1; i < this.points.length; i++) {
        	ctx.lineTo(this.points[i].x + this.center.x, this.points[i].y + this.center.y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    	
    }

    
    Polygon.prototype.intersectsWith = function(other) {
    	
    	var axis = new Point();
    	var tmp, minA, maxA, minB, maxB;
    	var side, i;
    	var smallest = null;
    	var overlap = 99999999;

    	/* test polygon A's sides */
    	for (side = 0; side < this.getNumberOfSides(); side++)
    	{
    		/* get the axis that we will project onto */
    		if (side == 0)
    		{
    			axis.x = this.points[this.getNumberOfSides() - 1].y - this.points[0].y;
    			axis.y = this.points[0].x - this.points[this.getNumberOfSides() - 1].x;
    		}
    		else
    		{
    			axis.x = this.points[side - 1].y - this.points[side].y;
    			axis.y = this.points[side].x - this.points[side - 1].x;
    		}

    		/* normalize the axis */
    		tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
    		axis.x /= tmp;
    		axis.y /= tmp;

    		/* project polygon A onto axis to determine the min/max */
    		minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
    		for (i = 1; i < this.getNumberOfSides(); i++)
    		{
    			tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
    			if (tmp > maxA)
    				maxA = tmp;
    			else if (tmp < minA)
    				minA = tmp;
    		}
    		/* correct for offset */
    		tmp = this.center.x * axis.x + this.center.y * axis.y;
    		minA += tmp;
    		maxA += tmp;

    		/* project polygon B onto axis to determine the min/max */
    		minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
    		for (i = 1; i < other.getNumberOfSides(); i++)
    		{
    			tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
    			if (tmp > maxB)
    				maxB = tmp;
    			else if (tmp < minB)
    				minB = tmp;
    		}
    		/* correct for offset */
    		tmp = other.center.x * axis.x + other.center.y * axis.y;
    		minB += tmp;
    		maxB += tmp;

    		/* test if lines intersect, if not, return false */
    		if (maxA < minB || minA > maxB) {
    			return false;
    		} else {
    			var o = (maxA > maxB ? maxB - minA : maxA - minB);
    			//var o = (maxA > minB ? maxA - minB : maxB - minA); // i think this line is wrong
    			if (o < overlap) {
    				//console.debug("%d is smaller than %d, found new lowest overlap", o, overlap);
    				overlap = o;
    			    smallest = {x: axis.x, y: axis.y};
    			}
    		}
    	}

    	/* test polygon B's sides */
    	for (side = 0; side < other.getNumberOfSides(); side++)
    	{
    		/* get the axis that we will project onto */
    		if (side == 0)
    		{
    			axis.x = other.points[other.getNumberOfSides() - 1].y - other.points[0].y;
    			axis.y = other.points[0].x - other.points[other.getNumberOfSides() - 1].x;
    		}
    		else
    		{
    			axis.x = other.points[side - 1].y - other.points[side].y;
    			axis.y = other.points[side].x - other.points[side - 1].x;
    		}

    		/* normalize the axis */
    		tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
    		axis.x /= tmp;
    		axis.y /= tmp;

    		/* project polygon A onto axis to determine the min/max */
    		minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
    		for (i = 1; i < this.getNumberOfSides(); i++)
    		{
    			tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
    			if (tmp > maxA)
    				maxA = tmp;
    			else if (tmp < minA)
    				minA = tmp;
    		}
    		/* correct for offset */
    		tmp = this.center.x * axis.x + this.center.y * axis.y;
    		minA += tmp;
    		maxA += tmp;

    		/* project polygon B onto axis to determine the min/max */
    		minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
    		for (i = 1; i < other.getNumberOfSides(); i++)
    		{
    			tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
    			if (tmp > maxB)
    				maxB = tmp;
    			else if (tmp < minB)
    				minB = tmp;
    		}
    		/* correct for offset */
    		tmp = other.center.x * axis.x + other.center.y * axis.y;
    		minB += tmp;
    		maxB += tmp;

    		/* test if lines intersect, if not, return false */
    		if (maxA < minB || minA > maxB) {
    			return false;
    		} else {
    			var o = (maxA > maxB ? maxB - minA : maxA - minB);
    			//var o = (maxA > minB ? maxA - minB : maxB - minA); // i think this line is wrong
    			if (o < overlap) {
    				//console.debug("%d is smaller than %d, found new lowest overlap", o, overlap);
    				overlap = o;
    			    smallest = {x: axis.x, y: axis.y};
    			}
    		}
    	}

		//console.debug("maxA = %d, minB = %d, minA = %d, maxB = %d", maxA, minB, minA, maxB)
    	//console.debug("overlap of %d on axis (%d, %d)", overlap, smallest.x, smallest.y);
    	return {"overlap": overlap + 0.001, "axis": smallest};
    	
    }
