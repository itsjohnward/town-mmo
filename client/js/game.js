const remote = require('electron').remote;
const app = remote.app;

var users = remote.getGlobal("users");
var user_sprites = {}
var player = remote.getGlobal("player");
var level = remote.getGlobal("world");


var word = "phaser";
var correct = [];
var bmd;
var chat;


console.log("game.js is running.");

var ASPECT_RATIO = 16/9;
var GAME_ASPECT_RATIO = 13.5/9;
var CHAT_ASPECT_RATIO = ASPECT_RATIO - GAME_ASPECT_RATIO; // 2.5/9

var TILE_SIZE = 16;
var ZOOM_FACTOR = 5;
//console.log($(window).width());

var WINDOW_WIDTH = $(window).width();
var WINDOW_HEIGHT = WINDOW_WIDTH / ASPECT_RATIO;
var GAME_WIDTH = WINDOW_WIDTH / ASPECT_RATIO * GAME_ASPECT_RATIO;
var CHAT_WIDTH = WINDOW_WIDTH - GAME_WIDTH;

var ROTATIONS = ["left", "right", "up", "down"];
var player_sprite;

var game = new Phaser.Game(WINDOW_WIDTH, WINDOW_HEIGHT, Phaser.AUTO, 'content', {
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
		return this.x * ZOOM_FACTOR * TILE_SIZE + TILE_SIZE/2;
	}
	this.getY = function() {
		return this.y * ZOOM_FACTOR * TILE_SIZE + TILE_SIZE/2;
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
	this.width = CHAT_WIDTH;
	this.height = WINDOW_HEIGHT;
	var background = new Phaser.Rectangle(GAME_WIDTH, 0, CHAT_WIDTH, WINDOW_HEIGHT);
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
	game.load.spritesheet(player.name, "./assets/player.png", 32, 48);
}

function buildWorld() {
	//game.world.setBounds(0, 0, 1280, 600);
	var x, y;
	y = 0;
	for(i in level) {
		x = 0;
		var temp = [];
		for (j in level[i]) {
			console.log(level[i][j]);
			temp.push(new Tile(level[i][j], x, y));
			x++;
		}
		tiles.push(temp);
		y++;

	}
}

function keyPress(char) {
    //  Clear the BMD
    bmd.cls();
    //  Set the x value we'll start drawing the text from
    var x = 64;
	//  Now draw the word, letter by letter, changing colour as required
	bmd.context.fillStyle = '#00ff00';
	bmd.context.fillText(char, x, 64);
	console.log(char);
	x += bmd.context.measureText(char).width;
}

function loadBitmapData() {
	//  This is our BitmapData onto which we'll draw the word being entered
    bmd = game.make.bitmapData(800, 200);
    bmd.context.font = '64px Arial';
    bmd.context.fillStyle = '#ffffff';
    bmd.context.fillText(word, 64, 64);
    bmd.addToWorld();

    //  Capture all key presses
    game.input.keyboard.addCallbacks(this, null, null, keyPress);
}

function controls() {
	if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
		player_sprite.move("up");
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
		player_sprite.move("left");
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
		player_sprite.move("down");
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
		player_sprite.move("right");
	}
}

function playerSync() {
	player.x = player_sprite.x;
	player.y = player_sprite.y;
}

function renderConnectedUsers() {
	var users = remote.getGlobal("users");
	for (i in users) {
		console.log(users[i]);
		if(users[i].name != player_sprite.name) {
			if(user_sprites[users[i].name] == undefined) {
				console.log("Creating: \n" +
					"\tuser_sprites[" + users[i].name + "] = new Sprite(\"player_sprite\", \"./assets/player_sprite.png\", " + users[i].x + ", " + users[i].y + ");");
				user_sprites[users[i].name] = new Sprite(player.name, "./assets/player.png", users[i].x, users[i].y);
			} else {
				console.log("Updating: \n" +
					"\tuser_sprites[" + users[i].name + "].setX(" + users[i].x + ");\n" +
					"\tuser_sprites[" + users[i].name + "].setY(" + users[i].y + ");\n"
				);
				user_sprites[users[i].name].setX(users[i].x);
				user_sprites[users[i].name].setY(users[i].y);
				user_sprites[users[i].name].updateLocation();
			}
		}
	}
}

function preload() {
	loadImages();
}

function create() {
	cursors = game.input.keyboard.createCursorKeys();
	buildWorld();
	player_sprite = new Sprite(player.name, "./assets/player.png", 2, 2);
	//chat = new Chat();
	//loadBitmapData();
	//game.camera.follow(player_sprite);
	//console.log(remote);

}

function update() {
	controls();
	playerSync();
}

function render() {
	renderConnectedUsers();
	//game.debug.geom(chat.background);
}
