var express = require('express');
var fs = require('fs');
var compress = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var logger = require('morgan');
var mysql = require('mysql');
var http = require('http');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

var conf = JSON.parse(fs.readFileSync('config.json', { encoding: 'utf-8' }));

// use jade for templates
app.set('view engine', 'jade');


// ------------ connect to database

var pool = mysql.createPool(conf.database);

// --------- set up routes and middleware and such

app.use(logger());

app.use(cookieParser()); // required before session.
app.use(session({ secret: conf.secret }));
app.use(bodyParser());
app.use(compress());

app.get('/', function(req, res, next) {
	fs.readFile('public/index.html', function(err, data) {
		res.setHeader('Content-Type', 'text/html');
		res.status(200).send(data);
	});
});

//---------------------- tiles (the ground)

app.get('/tiles', function(req, res, next) {
	
	pool.query('SELECT id, name, description, iswater, isrock, blockpolygon FROM ffz_tiles', function(err, rows) {
		if (err) {
			next(err);
		} else {
			if (rows.length > 0) {
				var data = [];
				for (var i = 0; i < rows.length; i++) {
					data.push({
						id: rows[i].id,
						name: rows[i].name,
						desc: rows[i].description,
						water: (rows[i].iswater === 1),
						rock: (rows[i].isrock === 1),
						poly: rows[i].blockpolygon
					});
				}
				res.send(data);
			} else {
				res.send('');
			}
		}
	});
	
});

app.get('/tiles/:n', function(req, res, next) {
	
	var iid = req.params.n;
	pool.query('SELECT imagedata FROM ffz_tiles WHERE id = ?', [iid], function(err, rows) {
		if (err) {
			next(err);
		} else {
			if (rows.length > 0) {
				res.setHeader('Content-Type', 'image/png');
				res.send(rows[0].imagedata);
			} else {
				res.send('');
			}
		}
	});
	
});


// ---------------------- objects (trees, rocks, frogs, whatnot)

app.get('/objects', function(req, res, next) {
	
	pool.query('SELECT id, imageid, name, description, blocks, heightOffset, widthOffset, collisionbox FROM ffz_objects', function(err, rows) {
		if (err) {
			next(err);
		} else {
			if (rows.length > 0) {
				var data = [];
				for (var i = 0; i < rows.length; i++) {
					data.push({
						id: rows[i].id,
						imgid: rows[i].imageid,
						name: rows[i].name,
						description: rows[i].description,
						blocking: (rows[i].blocks === 1),
						heightOffset: rows[i].heightOffset,
						widthOffset: rows[i].widthOffset,
						collisionBoxData: rows[i].collisionbox
					});
				}
				res.send(data);
			} else {
				res.send('');
			}
		}
	});
	
});

//---------------------- images (of the objects, i suppose)

app.get('/images', function(req, res, next) {
	
	pool.query('SELECT id, description FROM ffz_img', function(err, rows) {
		if (err) {
			next(err);
		} else {
			if (rows.length > 0) {
				var data = [];
				for (var i = 0; i < rows.length; i++) {
					data.push({
						id: rows[i].id,
						description: rows[i].description
					});
				}
				res.send(data);
			} else {
				res.send('');
			}
		}
	});
	
});

app.get('/image/:n', function(req, res, next) {
	
	var iid = req.params.n;
	pool.query('SELECT data FROM ffz_img WHERE id = ?', [iid], function(err, rows) {
		if (err) {
			next(err);
		} else {
			if (rows.length > 0) {
				res.setHeader('Content-Type', 'image/png');
				res.send(rows[0].data);
			} else {
				res.send('');
			}
		}
	});
	
});

// ------------------------------- areas ------------------------

app.get('/area/:n', function(req, res, next) {
	
	var aid = req.params.n;
	pool.query('SELECT data FROM ffz_areas WHERE id = ?', [aid], function(err, rows) {
		if (err) {
			next(err);
		} else {
			if (rows.length > 0) {
				var obj = JSON.parse(rows[0].data);
				res.send(obj);
			} else {
				res.send('');
			}
		}
	});
	
});


// ------------------------------------- weather stuff


function putLatestWeather(data, cb) {
	
	var STORE_WEATHER = 'INSERT INTO weather (zip, temperature, conditions) VALUES (?, ?, ?)';

	var a = [ data.current_observation.display_location.zip,
	          data.current_observation.temp_f,
	          data.current_observation.weather ];
	
	pool.query(STORE_WEATHER, a, function(err, result) {
		
		if (err) {
			cb(err);
		} else {
			if (result.affectedRows === 1) {
				console.log('---> updated weather data for ' + a[0] + ': ' + a[1] + ' ' + a[2]);
				cb(null);
			} else {
				cb(new Error('no data inserted!'));
			}
		}
		
	});
	
}

function getLatestWeather(zip, cb) {
	
	var WEATHER_QUERY = 'SELECT temperature as temp, conditions FROM weather WHERE zip = ? AND tstamp = (SELECT max(tstamp) FROM weather WHERE zip = ?)';
	
	pool.query(WEATHER_QUERY, [ zip, zip ], function(err, rows) {
		if (err) {
			cb(err);
		} else {
			if (rows.length > 0) {
				cb(null, rows[0]);
			} else {
				cb(null, null);
			}
		}
	});
	
}

function pullWeatherData(zip, cb) {
	
	http.get("http://api.wunderground.com/api/" + conf.wunderkey + "/conditions/q/" + zip + ".json", function(res) {
		
		var wData = '';
		res.on('data', function(chunk) {
			wData += chunk;
		});
		res.on('end', function() {
			var data = JSON.parse(wData);
			cb(null, data);
		});
		
	}).on('error', function(e) {
		cb(e);
	});
	
}

app.get('/weather', function(req, res, next) {
	
	getLatestWeather('17084', function(err, data) {
		if (err) {
			next(err);
		} else {
			res.send(data);
		}
	});
	
});

setInterval(function() {
	
	getLatestWeather('17084', function(err, data) {
		if (err) {
			console.log(err);
		} else {
			io.sockets.emit('weatherUpdate', data);
		}
	});

}, 300000);


function weatherTimer() {
	
	pullWeatherData('17084', function(err, data) {
		if (err) {
			console.log(err);
		} else {
			putLatestWeather(data, function(err) {
				if (err) {
					console.log(err);
				} else {
					setTimeout(weatherTimer, 1800000);
				}
			});
		}
	});
	
	
}

weatherTimer(); // run now, and then every 30 minutes

//------------------------------------------------------

var frogs = [];

io.on('connection', function(socket) {
	
    socket.on("frogmove", function(fdata) {
        socket.broadcast.emit("fm", fdata);
    });

    socket.on("objmove", function(odata) {
        //console.log('an object is moving');
        //console.log(odata);
        socket.broadcast.emit('sm', odata);
    });

    socket.on("ribbit", function(fdata) {
        socket.broadcast.emit("rbbt", fdata);
    });

    socket.on("startup", function(msg) {
        console.log("frog " + msg.fid + " connected");
        socket.broadcast.emit("newfrog", msg.fid);
        socket["frog_id"] = msg.fid;
        frogs.forEach(function(i) {
            socket.emit("newfrog", i);
        });
        frogs.push(msg.fid);
    });

	socket.on("disconnect", function() {
		var fid = socket["frog_id"];
		console.log("frog " + fid + " disconnected");
		socket.broadcast.emit("byefrog", fid);
		if (frogs.indexOf(fid) !== -1) {
			frogs.splice(frogs.indexOf(fid), 1);
		}
	});
	
	
});

// ------------ static content

app.use(express.static('public'));

// ------------------------- start the listening

var srv = server.listen(4000, function() {
	console.log('listening on port %d', srv.address().port);
});
