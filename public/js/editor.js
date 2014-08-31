        

function calculateObjectPositions() {
	
	var stuff = [];
    for (var i = 0; i < currentArea.objectGrid.length; i++) {
        for (var j = 0; j < currentArea.objectGrid[i].length; j++) {
            if (currentArea.objectGrid[i] && currentArea.objectGrid[i][j]) {
                
                var obj = currentArea.objectGrid[i][j];
                
                var oy = (i * world.tileHeight) + (world.tileHeight / 2);
                var ox = (j * world.tileWidth) + (world.tileWidth / 2);
    			if (obj.heightOffset) {
    				oy += obj.heightOffset;
    			}
    			if (obj.widthOffset) {
    			    ox += obj.widthOffset;
    			}
                
    			if (obj.id == 0) obj.id = obj.imgid;
    			stuff.push({type: obj.id, position: {x: ox, y: oy}});
    			
    			console.log("object at grid (" + j + ", " + i + ") should be anchored at (" + ox + ", " + oy + ")");

            }
        }
    }
    
    currentArea.objectList = stuff;
	
}


function deleteObject() {
        
            if (clickedObject != null) {

                document.getElementById("objContainer").removeChild(clickedObject);
                objGrid[clickedObject.matrixY][clickedObject.matrixX] = null;
                currentArea.objectGrid[clickedObject.matrixY][clickedObject.matrixX] = null;
                clickedObject.moveObj.destroy();
                clickedObject = null;
            
            }
        
        }
        
        function tilePaletteClick(e) {
        
            var tgt = e.target;
            tileToDrop = tgt.associateTile;
            dojo.query(".groundTile").removeClass("groundTileSelected");
            dojo.addClass(tgt, "groundTileSelected");
            e.stopPropagation();
        
        }
        
        function objectPaletteClick(e) {
        
            var tgt = e.target;
            objectToDrop = tgt.associateObject;
            dojo.query(".groundTile").removeClass("groundTileSelected");
            dojo.addClass(tgt, "groundTileSelected");
            e.stopPropagation();
        
        }

        function buildImgs() {

            var g = document.getElementById("gridContainer");
            g.innerHTML = "";

            var d = document.getElementById("imgContainer");
            d.innerHTML = "";
            
            for (var i = 0; i < currentArea.groundGrid.length; i++) {
            
                for (var j = 0; j < currentArea.groundGrid[i].length; j++) {

                    var img = document.createElement("img");
                    img.style.position = "absolute";
                    img.style.top = (i * world.tileHeight) + "px";
                    img.style.left = (j * world.tileWidth) + "px";
                    if (currentArea.groundGrid[i] && currentArea.groundGrid[i][j]) {
                        img.src = TileImgCache[currentArea.groundGrid[i][j].id].src;
                    } else {
                        img.src = "";
                    }
                
                    d.appendChild(img);
                    imgGrid[i][j] = img;
                    
                    // ---------------------------
                    
                    var img2 = document.createElement("img");
                    img2.matrixX = j;
                    img2.matrixY = i;
                    img2.style.position = "absolute";
                    img2.src = "images/tiles/transparent.png";
                    img2.title = j + ", " + i;
                    img2.style.top = img.style.top;
                    img2.style.left = img.style.left;
                    img2.onmouseover = hilightTile;
                    img2.onmouseout = unHilightTile;
                    img2.onclick = imgClick;
                    img2.style.zIndex = 0;
                    
                    dojo.connect(img2, 'oncontextmenu', "gridMenuClick");
                    gridPopMenu.bindDomNode(img2);
                    
                    g.appendChild(img2);
                    
                }
                
            }
        
        
        }

        function setLocation(obj, gx, gy) {
        
            var oy = (gy * world.tileHeight) + (world.tileHeight / 2);
            var ox = (gx * world.tileWidth) + (world.tileWidth / 2);
			if (obj.heightOffset) {
				oy += obj.heightOffset;
			}
			if (obj.widthOffset) {
			    ox += obj.widthOffset;
			}
            if (obj.boxcenter) {
                obj.style.top = (oy - obj.boxcenter.y) + "px";
                obj.style.left = (ox - obj.boxcenter.x) + "px";
            } else {
                obj.style.top = (oy - obj.height) + "px";
                obj.style.left = (ox -(obj.width/2)) + "px";
            }
            obj.matrixX = gx;
            obj.matrixY = gy;
            obj.title = gx + ", " + gy;
        
        }

        function createObjImg(container, x, y) {
        
            var obj = currentArea.objectGrid[y][x];
            var img = document.createElement("img");
            img.style.position = "absolute";
            img.src = ImgCache[obj.imgid].src;
            img.width = ImgCache[obj.imgid].width;
            img.height = ImgCache[obj.imgid].height;
            if (obj.heightOffset) {
                img.heightOffset = obj.heightOffset;
            }
            if (obj.widthOffset) {
                img.widthOffset = obj.widthOffset;
            }
            if (obj.boxcenter) {
                img.boxcenter = { x: obj.boxcenter.x, y: obj.boxcenter.y };
            }
            setLocation(img, x, y);
            img.style.cursor = "move";
            img.onmouseover = hilightObject;
            img.onmouseout = unHilightObject;
            img.style.zIndex = 1;
                        
            container.appendChild(img);
            objGrid[y][x] = img;

            dojo.connect(img, 'oncontextmenu', "objMenuClick");
                        
            var movingObj = new dojo.dnd.Moveable(img);
            movingObj.onMoveStop = stopObjectMove;
            img.moveObj = movingObj;
            
            objPopMenu.bindDomNode(img);
        
        }

        function buildObjs() {

            var oc = document.getElementById("objContainer");
            oc.innerHTML = "";
            
            for (var i = 0; i < currentArea.objectGrid.length; i++) {
                for (var j = 0; j < currentArea.objectGrid[i].length; j++) {
                    if (currentArea.objectGrid[i] && currentArea.objectGrid[i][j]) {
                        createObjImg(oc, j, i);
                    }
                }
            }
        
        }

        
        function hilightTile() {
            this.style.border = "1px solid #000000";
            this.style.zIndex++;
        }

        function unHilightTile() {
            this.style.border = "";
            this.style.zIndex = 0;
        }

        function hilightObject() {
        }

        function unHilightObject() {
        }
        
        function stopObjectMove(mover) {
        
            var obj = mover.node;
            
            var ost = obj.style.top;
            var osl = obj.style.left;
            
            var objTop = ost.replace(/px/, "");
            var objLeft = osl.replace(/px/, "");

            var gridLocX = objLeft - (world.tileWidth / 2);
            var gridLocY = objTop - (world.tileHeight / 2);
            if (obj.boxcenter) {
                gridLocY = gridLocY + obj.boxcenter.y;
                gridLocX = gridLocX + obj.boxcenter.x;
            } else {
                gridLocY = gridLocY + obj.height;
                gridLocX = gridLocX + (obj.width/2);
                if (obj.heightOffset) {
                    gridLocY -= obj.heightOffset;
                }
                if (obj.widthOffset) {
                    gridLocX -= obj.widthOffset;
                }
            }
            
            var gx = Math.round(gridLocX / world.tileWidth);
            var gy = Math.round(gridLocY / world.tileHeight);

            if (currentArea.objectGrid[gy] && gx >= 0 && gx < currentArea.objectGrid[0].length && currentArea.objectGrid[gy][gx] == null) {
            
                // nothing is already in that place, put this object there
            
                var o = currentArea.objectGrid[obj.matrixY][obj.matrixX];
                currentArea.objectGrid[gy][gx] = o;
                currentArea.objectGrid[obj.matrixY][obj.matrixX] = null;
                setLocation(obj, gx, gy);
                
            } else {
            
                // there was already something there, or we've gone out of bounds.
                // put this object back where it came from
                
                setLocation(obj, obj.matrixX, obj.matrixY);
                
            }
            
        }
        
        function imgClick() {
        
            if (editMode == 1) {
                if (tileToDrop == null) {
                    return;
                }
                imgGrid[this.matrixY][this.matrixX].src = TileImgCache[tileToDrop.id].src;
                currentArea.groundGrid[this.matrixY][this.matrixX] = tileToDrop;
            } else if (editMode == 2) {
                if (objectToDrop == null || currentArea.objectGrid[this.matrixY][this.matrixX] != null) {
                    return;
                }
                currentArea.objectGrid[this.matrixY][this.matrixX] = objectToDrop;
                createObjImg(document.getElementById("objContainer"), this.matrixX, this.matrixY);
            }
        }
        
        
        function addRows(num, at, filltype) {
        
            var cols = currentArea.groundGrid[0].length;
            for (var i = 0; i < num; i++) {
                var newRow = new Array(cols);
                for (var j = 0; j < cols; j++) {
                    if (filltype == 0) {
                        newRow[j] = tileToDrop;
                    } else {
                        newRow[j] = currentArea.groundGrid[at][j];
                    }
                }
                currentArea.groundGrid.splice(at, 0, newRow);
                newRow = new Array(cols);
                currentArea.objectGrid.splice(at, 0, newRow);
                newRow = new Array(cols);
                imgGrid.splice(at, 0, newRow);
                newRow = new Array(cols);
                objGrid.splice(at, 0, newRow);
            }
            buildImgs();
            buildObjs();
        
        }

        function addColumns(num, at, filltype) {
        
            var rows = currentArea.groundGrid.length;
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < num; j++) {
                    if (filltype == 0) {
                        currentArea.groundGrid[i].splice(at, 0, tileToDrop);
                    } else {
                        currentArea.groundGrid[i].splice(at, 0, currentArea.groundGrid[i][at]);
                    }
                    currentArea.objectGrid[i].splice(at, 0, null);
                    imgGrid[i].splice(at, 0, null);
                    objGrid[i].splice(at, 0, null);
                }
            }
            buildImgs();
            buildObjs();
        
        }


        function doGroundEdit() {

            tilesPaneClick();

            editMode = 1;

            var d = document.getElementById("imgContainer");
            d.style.zIndex = -100;
            d.style.opacity = 1.0;

            var o = document.getElementById("objContainer");
            o.style.zIndex = 0;
            o.style.opacity = 0.4;

            var g = document.getElementById("gridContainer");
            g.style.zIndex = 100;
        
        }

        function doObjectEdit() {
        
            objectsPaneClick();

            editMode = 2;
        
            var d = document.getElementById("imgContainer");
            d.style.zIndex = -100;
            d.style.opacity = 0.6;

            var g = document.getElementById("gridContainer");
            g.style.zIndex = 0;

            var o = document.getElementById("objContainer");
            o.style.zIndex = 100;
            o.style.opacity = 1.0;
        
        }

      function dumpWorld() {

          console.log(dojo.toJson(currentArea));

      }
      
      function populateAreasList() {
      
          areaToLoad = null;
		  dojo.byId("areasListDiv").innerHTML = "";
          var xhrArgs = {
				url: "/ffz/area",
				handleAs: "text",
				load: function(data) {
					var areasList = dojo.fromJson(data);
					dojo.forEach(areasList, function(a) {
					    var n = document.createElement("div");
					    n.innerHTML = "<div onclick=\"dojo.query('#areasListDiv .areaDescription').removeClass('areaDescriptionSelected'); dojo.addClass(this, 'areaDescriptionSelected'); areaToLoad = " + a.id + ";\" class=\"areaDescription\">" + a.name + ", " + a.description + "</div>";
					    dojo.byId("areasListDiv").appendChild(n);
					});
		        }
		  };
		  var deferred = dojo.xhrGet(xhrArgs);
      
      }
      
      function saveArea() {
      
    	  calculateObjectPositions();
          currentArea.id = -1;
          currentArea.name = dojo.byId("areaName").value;
          currentArea.description = dojo.byId("areaDescription").value;
          var xhrArgs = {
				url: "/ffz/area",
				handleAs: "text",
				postData: "data=" + dojo.toJson(currentArea).replace(/undefined/g, "null"),
				load: function(data) {
					alert("Saved!");
		        }
		  };
		  var deferred = dojo.xhrPost(xhrArgs);
      
      }

function displayLinks() {
	
	var linkTop = dojo.byId("topLinkInput");
	var linkBottom = dojo.byId("bottomLinkInput");
	var linkRight = dojo.byId("rightLinkInput");
	var linkLeft = dojo.byId("leftLinkInput");
	
	linkTop.value = getLink(0);
	linkBottom.value = getLink(1);
	linkRight.value = getLink(2);
	linkLeft.value = getLink(3);
	
	
}      
      
function updateLinks() {
	
	var linkTop = dojo.byId("topLinkInput").value;
	var linkBottom = dojo.byId("bottomLinkInput").value;
	var linkRight = dojo.byId("rightLinkInput").value;
	var linkLeft = dojo.byId("leftLinkInput").value;
	
	if (currentArea.links == null) {
		currentArea.links = [];
	}
	
	setLink(0, linkTop);
	setLink(1, linkBottom);
	setLink(2, linkRight);
	setLink(3, linkLeft);
	
}

function getLink(type) {

	for (var l in currentArea.links) {
		var n = currentArea.links[l];
		if (n.type == type) {
			return n.areaId;
		}
	}
	return "";

}

function setLink(type, areaid) {

	if (areaid == null || areaid.length == 0) return;
	
	var found = false;
	for (var l in currentArea.links) {
		var n = currentArea.links[l];
		if (n.type == type) {
			n.areaId = Number(areaid);
			found = true;
		}
	}
	if (!found) {
		currentArea.links.push({
			'areaId': Number(areaid),
			'type': Number(type)
		});
	}
	
}