var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var CHARACTER_MODELS = [
	//"assets/white-character.png",
	//"assets/red-character.png",
	//"assets/blue-character.png",
	//"assets/green-character.png",
	//"assets/yellow-character.png",
	//"assets/black-character.png",
	//"assets/purple-character.png",
	//"assets/orange-character.png",
	{
		name: "player",
		url: "./assets/player.png"
	}
];

var tileset = [
	{
		name: "wall",
		url: "./assets/wall.png",
		collideable: true
	},
	{
		name: "floor",
		url: "./assets/Ground_Tile.png",
		collideable: false
	},
	{
		name: "road",
		url: "./assets/Road.png",
		collideable: false
	},
	{
		name: "house",
		url: "./assets/House.png",
		collideable: true
	}
];

var ROTATIONS = ["left", "right", "up", "down"];

var users = {};
var connected_users = {};
var messages = [];
var server = {};

var user = function(_username, _password, _ip) {
	this.username = _username;
	this.password = _password;
	this.ip = _ip;
	this.x = 3;
	this.y = 3;
	this.rotation = 0;
	this.model = CHARACTER_MODELS[Math.floor(Math.random() * (CHARACTER_MODELS.length))];
	this.connected = true;
	this.move = function(x, y, rotation) {
		this.x = x;
		this.y = y;
		this.rotation = rotation;
		console.log("{move} " + this.username + ": " + this.x + ", " + this.y + " (" + this.rotation + ")");
	}
	this.connect = function(_ip) {
		ip = _ip;
		connected = true;
		connected_users[this.username] = this;
	}
	this.disconnect = function() {
		connected = false;
		delete connected_users[this.username];
	}
}

var world = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

app.get('/world', function (req, res) {
	console.log('Got get request at /world');
	res.send(world);
	console.log('Sent world');
});

app.get('/users', function (req, res) {
	//res.send('Got a GET request at /user');
	console.log('Got a GET request at /users');
	res.send(users);
});

app.get('/connected_users', function (req, res) {
	//res.send('Got a GET request at /user');
	console.log('Got a GET request at /connected_users');
	res.send(connected_users);
});

app.get('/user/:username', function (req, res) {
	console.log('Got a GET request at /user');
	res.send(users[req.params.username]);
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/ping', function(req, res) {
	res.send("yes");
});
app.get('/login', function(req, res) {
	//console.log(req.query);
	//console.log(req);
	server.ip = req.query.server;
	if(users[req.query.username] == undefined) {
		users[req.query.username] = new user(req.query.username, req.query.password);
		//console.log(req.query);
		//console.log(req.query.address);
		res.send("yes");
	}
	else {
		if(users[req.query.username].password == req.query.password) {
			res.send("yes");
		}
		else {
			res.send("no");
		}
	}
});
/*
app.get('/game', function(req, res) {
	res.sendFile(__dirname + '/game.html');
});
app.get('/js/game.js', function(req, res) {
	res.sendFile(__dirname + '/js/game.js');
});
app.get('/js/phaser.js', function(req, res) {
	res.sendFile(__dirname + '/js/phaser.js');
});
app.get('/styles/style.css', function(req, res) {
	res.sendFile(__dirname + '/styles/style.css');
});
app.get('/assets/player.png', function(req, res) {
	res.sendFile(__dirname + '/assets/player.png');
});
app.get('/assets/player2.png', function(req, res) {
	res.sendFile(__dirname + '/assets/player2.png');
});
*/
io.on('connection', function(socket){
	var username = socket.handshake.query.username;
	console.log("{connection} " + username);
	users[username].connect();
	io.emit('joined', username);
	socket.on('disconnect', function(){
		users[username].disconnect();
		console.log("{disconnection} " + username);
		io.emit('left', username);
	});
	socket.on('message', function(msg){
		messages.push(msg);
		var fmsg = "[" + msg.timestamp + "] " + msg.from + ": " + msg.text;
		console.log("{chat} " + fmsg);
		io.emit('message', fmsg);
	});
	socket.on('user_move', function(move) {
		//console.log(users);
		//console.log(move);
		if(users[move.user] != undefined) {
			users[move.user].x = move.x;
			users[move.user].y = move.y;
			users[move.user].rotation = move.rotation;
			console.log("{move} " + move.user + ": " + move.x + ", " + move.y + " (" + ROTATIONS[move.rotation] + ")");
		}
		io.emit('user_move', move);
	});
	socket.on('place', function(cmd) {
		//console.log(users);
		//console.log(move);
		console.log("{place} " + cmd.user + ": " + tileset[cmd.block_index].name + " at " + cmd.x + ", " + cmd.y);
		world[cmd.y][cmd.x] = cmd.block_index;
		io.emit('place', cmd);
	});
});

http.listen(3000, function(){
  console.log('Town application server is now listening on port 3000!');
});
