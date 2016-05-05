
const remote = require('electron').remote;
const app = remote.app;

var users = {};
var user_sprites = {}
var player = "";
var world = {};
var synced = {};
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

function httpGetAsync(theUrl, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

/*
	-------------------
	| START CHAT CODE |
	-------------------
*/

function getTime() {
	var now = new Date();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
	if(hour.toString().length == 1) {
		var hour = '0'+hour;
	}
	if(minute.toString().length == 1) {
		var minute = '0'+minute;
	}
	if(second.toString().length == 1) {
		var second = '0'+second;
	}
	var time = hour+':'+minute+':'+second;
	return time;
}

function getQueryVariable(variable){
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
		   var pair = vars[i].split("=");
		   if(pair[0] == variable){return pair[1];}
   }
   return(false);
}

var server = {};
server.ip = getQueryVariable("server");
//console.log(server);
//console.log(remote.getGlobal("server"));
server.socket = io.connect(server.ip + "?username=" + getQueryVariable("username"));
$('form').submit(function(){
	var msg = {}
	msg.timestamp = getTime();
	msg.from = getQueryVariable("username");
	msg.text = $('#m').val();
	server.socket.emit('message', msg);
	$('#m').val('');
	return false;
});
server.socket.on('joined', function(user) {
	$('#messages').append($('<li>').text(user + " just joined the chat."));
	users[user.name] = user;
	console.log(user.name + " just joined the chat");
})
server.socket.on('left', function(user) {
	$('#messages').append($('<li>').text(user + " just left the chat."));
	delete users[user];
	console.log(user + " just left the chat");
})
server.socket.on('message', function(msg){
	$('#messages').append($('<li>').text(msg));
});
server.socket.on('move', function(move) {
	users[move.user].x = move.x;
	users[move.user].y = move.y;
	users[move.user].rotation = move.rotation;
});


/*
	-----------------
	| END CHAT CODE |
	-----------------
*/


//const remote = require('electron').remote;
//var server = remote.getGlobal("server");

//var ASPECT_RATIO = 16/9;
//var GAME_ASPECT_RATIO = 13.5/9;
//var CHAT_ASPECT_RATIO = ASPECT_RATIO - GAME_ASPECT_RATIO; // 2.5/9

var TILE_SIZE = 16;
var ZOOM_FACTOR = 5;
//console.log($(window).width());

var WINDOW_WIDTH = $(window).width();
var WINDOW_HEIGHT = $(window).height();
var GAME_WIDTH = WINDOW_WIDTH * 0.8;
var CHAT_WIDTH = WINDOW_WIDTH-GAME_WIDTH;

var ROTATIONS = ["left", "right", "up", "down"];
var player_sprite;

var game = new Phaser.Game(GAME_WIDTH, WINDOW_HEIGHT, Phaser.AUTO, 'content', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

function coord_to_pixels(c) {
	return c * ZOOM_FACTOR * TILE_SIZE + (ZOOM_FACTOR*TILE_SIZE)/2;
}

function Sprite(name, url, x, y) {
	this.move = function(direction) {
		if((this.moveTime + this.moveThreshold) < game.time.now) {
			if(ROTATIONS[this.rotation] != direction) {
				var direction_int = ROTATIONS.indexOf(direction);
				this.rotation = direction_int >= 0 ? direction_int : this.rotation;
				this.moveTime = game.time.now;
			}
			else {
				var x_par = 0;
				var y_par = 0;
				if(direction == "left") {
					x_par = -1;
				} else if (direction == "right") {
					x_par = 1;
				} else if (direction == "up") {
					y_par = -1;
				} else if (direction == "down") {
					y_par = 1;
				} else {
					return;
				}
				if(!(tiles[this.y + y_par][this.x + x_par].collideable)){
					this.x += x_par;
					this.y += y_par;
					this.moveTime = game.time.now;
				}
				else {
					//COLLIDE
				}
			}
			this.updateLocation();
		}
	}
	this.updateLocation = function() {
		this.sprite.x = this.getX(); // ADD LERP
		this.sprite.y = this.getY(); // ADD LERP
		//console.log(this.sprite.scale.x);
		//this.sprite.scale.x = Math.abs(this.sprite.scale.x) - (this.rotation % 2) * 2 * Math.abs(this.sprite.scale.x);
		if(ROTATIONS[this.rotation] == "up") {
			this.sprite.angle = 90;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		} else if(ROTATIONS[this.rotation] == "down"){
			this.sprite.angle = -90;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		} else if(ROTATIONS[this.rotation] == "left") {
			this.sprite.angle = 0;
			this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
		} else if(ROTATIONS[this.rotation] == "right") {
			this.sprite.angle = 0;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		}
	}
	this.getX = function() {
		return this.x * ZOOM_FACTOR * TILE_SIZE + (TILE_SIZE*ZOOM_FACTOR)/2;
	}
	this.getY = function() {
		return this.y * ZOOM_FACTOR * TILE_SIZE + (TILE_SIZE*ZOOM_FACTOR)/2;
	}
	this.setX = function(x) {
		this.x = x; // ADD LERP
	}
	this.setY = function(y) {
		this.y = y; // ADD LERP
	}
	this.setRotation = function(rotation) {
		if(rotation == "up") {
			this.sprite.angle = 90;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		} else if(rotation == "down"){
			this.sprite.angle = -90;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		} else if(rotation == "left") {
			this.sprite.angle = 0;
			this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
		} else if(rotation == "right") {
			this.sprite.angle = 0;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		}
	}

	this.name = name;
	this.url = url;
	this.x = x;
	this.y = y;
	this.sprite = game.add.sprite(this.getX(), this.getY(), this.name);
	this.sprite.width = TILE_SIZE * ZOOM_FACTOR;
	this.sprite.height = TILE_SIZE * ZOOM_FACTOR;
	this.sprite.anchor.setTo(0.5, 0.5);
	this.moveTime = 0;
	this.moveThreshold = 150;
	this.rotation = 0;
}

function Tile(val, x, y) {
  this.url = tileset[val].url;
  this.x = x;
  this.y = y;
  this.collideable = tileset[val].collideable;
  var sprite = game.add.sprite(coord_to_pixels(x), coord_to_pixels(y), tileset[val].name);
  sprite.anchor.setTo(0.5, 0.5);
  sprite.width = ZOOM_FACTOR * TILE_SIZE;
  sprite.height = ZOOM_FACTOR * TILE_SIZE;
}

function World() {

}

function Chat() {
	var socket = io();
	$('form').submit(function(){
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});
	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg));
	});
}

var tileset = [
	{
		name: "wall",
		url: "./assets/wall.png",
		collideable: true
	},
	{
		name: "floor",
		url: "./assets/floor.png",
		collideable: false
	}
];

var tiles = []

function loadImages() {
	for (i in tileset) {
		game.load.image(tileset[i].name, tileset[i].url);
	}
	game.load.image(tileset[i].name, tileset[i].url);
	for(i in CHARACTER_MODELS) {
		game.load.spritesheet(CHARACTER_MODELS[i].name, CHARACTER_MODELS[i].url, 32, 48);
	}
}

function buildWorld(data) {
	//game.world.setBounds(0, 0, 1280, 600);
	world = data;
	var x, y;
	y = 0;
	for(i in world) {
		x = 0;
		var temp = [];
		for (j in world[i]) {
			console.log(world[i][j]);
			temp.push(new Tile(world[i][j], x, y));
			x++;
		}
		tiles.push(temp);
		y++;

	}
}

function controls() {
	if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
		player_sprite.move("up");
		var pos = {
			user: player_sprite.name,
			x: player_sprite.x,
			y: player_sprite.y,
			rotation: player_sprite.rotation
		}
		server.socket.emit('move', pos);
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
		player_sprite.move("left");
		var pos = {
			user: player_sprite.name,
			x: player_sprite.x,
			y: player_sprite.y,
			rotation: player_sprite.rotation
		}
		server.socket.emit('move', pos);
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
		player_sprite.move("down");
		var pos = {
			user: player_sprite.name,
			x: player_sprite.x,
			y: player_sprite.y,
			rotation: player_sprite.rotation
		}
		server.socket.emit('move', pos);
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
		player_sprite.move("right");
		var pos = {
			user: player_sprite.name,
			x: player_sprite.x,
			y: player_sprite.y,
			rotation: player_sprite.rotation
		}
		server.socket.emit('move', pos);
	}
}

function playerSync() {
	if(users[player] != undefined) {
		users[player].x = player_sprite.x;
		users[player].y = player_sprite.y;
	}
}

function renderConnectedUsers(data) {
	//var users = remote.getGlobal("users");
	if(data != undefined) {
		users = data;
	}
	if(player_sprite == undefined) {
		player_sprite = new Sprite(data[player].model.name, data[player].model.url, 2, 2);
	}
	for (i in users) {
		//console.log(users[i]);
		if(users[i].username != player_sprite.name) {
			if(user_sprites[users[i].username] == undefined) {
				console.log("Creating: \n" +
					"\tuser_sprites[" + users[i].username + "] = new Sprite(\"player_sprite\", \"./assets/player_sprite.png\", " + users[i].x + ", " + users[i].y + ");");
				user_sprites[users[i].username] = new Sprite(users[i].model.name, users[i].model.url, users[i].x, users[i].y);
			} else {
				console.log("Updating: \n" +
					"\tuser_sprites[" + users[i].username + "].setX(" + users[i].x + ");\n" +
					"\tuser_sprites[" + users[i].username + "].setY(" + users[i].y + ");\n"
				);
				user_sprites[users[i].username].setX(users[i].x);
				user_sprites[users[i].username].setY(users[i].y);
				user_sprites[users[i].username].updateLocation();
			}
		}
	}
}


var resizeGame = function () {
	var height = window.innerHeight;
	var width = window.innerWidth * 0.8;
	game.width = width;
	game.height = height;
	game.stage.bounds.width = width;
	game.stage.bounds.height = height;

	if (game.renderType === 1) {
		game.renderer.resize(width, height);
		//Phaser.Canvas.setSmoothingEnabled(game.context, false);
	}

	game.camera.setSize(width, height);
}


function preload() {
	player = getQueryVariable("username");
	loadImages();
}

function create() {

	httpGetAsync(server.ip + "/world", buildWorld);
	httpGetAsync(server.ip + "/users", renderConnectedUsers);

	cursors = game.input.keyboard.createCursorKeys();

	console.log("test");

	//world = remote.getGlobal("world");
	//buildWorld();

	//playerSync();

	/*
	while(true) {
		synced = remote.getGlobal("synced");
		console.log(synced);
		if (synced) {
			world = remote.getGlobal("world");
			buildWorld()
			player_sprite = new Sprite(player.name, "./assets/player.png", 2, 2);
			playerSync();
			break;
		}
	}
	*/

	//chat = new Chat();
	//loadBitmapData();
	//game.camera.follow(player_sprite);
	//console.log(remote);

}

function update() {
	controls();
	//playerSync();
}

function render() {
	playerSync();
	renderConnectedUsers();
	//game.debug.geom(chat.background);
}
