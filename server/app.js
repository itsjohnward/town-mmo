var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var param;

/*
app.get('/', function (req, res) {
	res.sendFile("/Users/john/Google Drive/active/class-gamedev/town-mmo/client/index.html",function(err){ // Transfer The File With COntent Type Text/HTML
        if(err){
            res.end("Sorry, Error.");
        }else{
            res.end(); // Send The Response
        }
	})
});
app.get('/js/game.js', function (req, res) {
	res.sendFile("/Users/john/Google Drive/active/class-gamedev/town-mmo/client/js/game.js",function(err){ // Transfer The File With COntent Type Text/HTML
        if(err){
            res.end("Sorry, Error.");
        }else{
            res.end(); // Send The Response
        }
	})
});
*/

var users = {};

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

app.get('/user', function (req, res) {
	res.send('Got a GET request at /user');
	console.log('Got a GET request at /user');
});

app.post('/user', function (req, res) {
	console.log('Got a POST request at /user');
	console.log(req.body.name);

	console.log(JSON.parse(req.body.name).name);
	users[""+JSON.parse(req.body.name).name+""] = JSON.parse(req.body.name);
	console.log(users);
	res.send(users);
});

/*
app.put('/user', function (req, res) {
  res.send('Got a PUT request at /user');
  console.log('Got a PUT request at /user');
});

app.delete('/user', function (req, res) {
  res.send('Got a DELETE request at /user');
  console.log('Got a DELETE request at /user');
});
*/

app.listen(3000, function () {
  console.log('Town MMO server application listening on port 3000!');
});
