
    function loadTiles() {

		var xhrArgs = {
				url: "tiles",
				handleAs: "json",
				sync: true,
				load: function(data) {

					window.Tiles = {};
					window.TileImgCache = [];
					
					for (var i = 0; i < data.length; i++) {
						
						var tid = data[i].id;
						var n = data[i].name.toLowerCase().replace(/\s/g, '_');
						window.Tiles[n] = data[i];
						
						window.TileImgCache[tid] = new Image();
						window.TileImgCache[tid].src = "tiles/" + tid
						window.TileImgCache[tid].description = data[i].desc;
						window.TileImgCache[tid].water = data[i].water;
						window.TileImgCache[tid].rock = data[i].rock;
						//TODO: something with blockpoly
						
					}
					
					console.log("tiles loaded");
					loadObjects();
					
		        }
		};
		var deferred = dojo.xhrGet(xhrArgs);

    }

    function loadObjects() {

		var xhrArgs = {
				url: "objects",
				handleAs: "json",
				sync: true,
				load: function(data) {
					window.ObjCache = new Array();
					window.totalObjects = data.length;
					for (var i = 0; i < data.length; i++) {
						window.ObjCache[data[i].id] = data[i];
					}
					console.log(window.totalObjects + " objects loaded");
					loadImages();
		        }
		};
		var deferred = dojo.xhrGet(xhrArgs);

    }

    function loadImages() {

		var xhrArgs = {
				url: "images",
				handleAs: "json",
				sync: true,
				load: function(data) {
					window.ImgCache = new Array();
					window.imagesLoaded = 0;
					window.totalImages = data.length;
					for (var i = 0; i < data.length; i++) {
						var m = new Image();
						m.onload = function() {
							window.imagesLoaded++;
						}
						m.src = "image/" + data[i].id;
						window.ImgCache[data[i].id] = m;
					}
					setTimeout(checkImageLoads, 250);
		        }
		};
		console.log("loading images...");
		var deferred = dojo.xhrGet(xhrArgs);

    }
    
    function checkImageLoads() {
    	
    	if (window.imagesLoaded < window.totalImages) {
    		setTimeout(checkImageLoads, 250);
    	} else {
			console.log("...complete! " + window.totalImages + " images loaded");
			createShadows();
    	}
    	
    }
    
    function createShadows() {
    	
		console.log("creating shadows...");
    	
		window.ShadowCache = new Array();
		for (var i = 0; i < window.ImgCache.length; i++) {
			if (window.ImgCache[i] != null) {
				s = shadowImage(window.ImgCache[i]);
				window.ShadowCache[i] = s;
			}
		}
    	
		console.log("...complete! " + window.totalImages + " shadows created");
		loadArea(window.areaId);
    	
    }

    
    function loadArea(id, callWhenDone) {

    	if (id == null) id = 1;
    	if (callWhenDone == null) callWhenDone = firstTimeInit;
		var xhrArgs = {
				url: "area/" + id,
				handleAs: "json",
				load: function(data) {
					currentArea = data;
					console.log("area " + id + " loaded");
					callWhenDone();
		        }
		};
		var deferred = dojo.xhrGet(xhrArgs);

    }
