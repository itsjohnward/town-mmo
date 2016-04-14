const remote = require('electron').remote;
const app = remote.app;

var users = remote.getGlobal("users");
var player = remote.getGlobal("player");


console.log("game.js is running.");

var GAME_SIZE = 2;
var TILE_SIZE = 16;
var ROTATIONS = ["left", "right", "up", "down"];
var player_sprite;

var game = new Phaser.Game(GAME_SIZE*16*16, GAME_SIZE*16*16, Phaser.AUTO, 'content', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

function coord_to_pixels(c) {
	return c * GAME_SIZE * TILE_SIZE + TILE_SIZE/2;
}

function Sprite(name, url, x, y) {
	this.move = function(direction) {
		if((this.moveTime + this.moveThreshold) < game.time.now) {
			if(ROTATIONS[player.rotation] != direction) {
				var direction_int = ROTATIONS.indexOf(direction);
				player.rotation = direction_int >= 0 ? direction_int : player.rotation;
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
				if(!(tiles[player.y + y_par][player.x + x_par].collideable)){
					player.x += x_par;
					player.y += y_par;
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
		if(ROTATIONS[player.rotation] == "up") {
			this.sprite.angle = 90;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		} else if(ROTATIONS[player.rotation] == "down"){
			this.sprite.angle = -90;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		} else if(ROTATIONS[player.rotation] == "left") {
			this.sprite.angle = 0;
			this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
		} else if(ROTATIONS[player.rotation] == "right") {
			this.sprite.angle = 0;
			this.sprite.scale.x = Math.abs(this.sprite.scale.x);
		}
	}
	this.getX = function() {
		return player.x * GAME_SIZE * TILE_SIZE + TILE_SIZE/2;
	}
	this.getY = function() {
		return player.y * GAME_SIZE * TILE_SIZE + TILE_SIZE/2;
	}

	this.name = name;
	this.url = url;
	player.x = x;
	player.y = y;
	this.sprite = game.add.sprite(this.getX(), this.getY(), this.name);
	this.sprite.width = TILE_SIZE * GAME_SIZE;
	this.sprite.height = TILE_SIZE * GAME_SIZE;
	this.sprite.anchor.setTo(0.5, 0.5);
	this.moveTime = 0;
	this.moveThreshold = 150;
	player.rotation = 0;
}

function Tile(val, x, y, height, width, collideable) {
  this.url = tileset[val].url;
  player.x = x;
  player.y = y;
  this.height = height;
  this.width = width;
  this.collideable = tileset[val].collideable;
  var sprite = game.add.sprite(coord_to_pixels(x), coord_to_pixels(y), tileset[val].name);
  sprite.anchor.setTo(0.5, 0.5);
  sprite.width = GAME_SIZE * TILE_SIZE;
  sprite.height = GAME_SIZE * TILE_SIZE;
}

var level = [];
//var sync = function();

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

function preload() {
	for (i in tileset) {
		game.load.image(tileset[i].name, tileset[i].url);
	}
	game.load.image(tileset[i].name, tileset[i].url);
	game.load.spritesheet("player_sprite", "./assets/player.png", 32, 48);
	level = remote.getGlobal("world");
	//sync = remote.getGlobal("sync");
	console.log(level);
}

function create() {
	cursors = game.input.keyboard.createCursorKeys();
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
	player_sprite = new Sprite("player_sprite", "./assets/player.png", 2, 2);

	console.log(remote);
}

function update() {
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

function render() {

}
