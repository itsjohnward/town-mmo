'use strict';

var http = require('http');
var request = require('request');
var prompt = require('prompt');

global["world"] = {};
global["users"] = {};
global["player"] = {
	name: "",
	x: 5,
	y: 5,
	rotation: "up"
};
var server = global["server"] = {
	url: ""
};
global["synced"] = false;

//prompt.start();
//prompt.get(['username'/*, 'email'*/], function (err, result) {
	//
	// Log the results.
	//
	//console.log('Command-line input received:');
	//console.log('  username: ' + result.username);
	//console.log('  email: ' + result.email);
//	global["player"].name = result.username;
//});

//global["users"] = {};





/*
var post_req = http.request(
	{
		host: 'localhost',
		path: '/user',
		//since we are listening on a custom port, we need to specify it by hand
		port: '3000',
		//This is what changes the request to a POST request
		method: 'POST'
	},
	function(response) {
	    // Continuously update stream with data
	    var body = '';
	    response.on('data', function(d) {
			console.log(d);
	        body += d;
	    });
	    response.on('end', function() {

	        // Data reception is done, do whatever with it!
			console.log(body);
			console.log("PARSING");
	        var parsed = JSON.parse(body);

	        console.log(parsed);

	    });
	}
);
*/
/*
http.get(
	"http://localhost:3000/user/"+JSON.stringify(user), function(response) {
	    // Continuously update stream with data
	    var body = '';
	    response.on('data', function(d) {
			console.log(d);
	        body += d;
	    });
	    response.on('end', function() {

	        // Data reception is done, do whatever with it!
	        var parsed = JSON.parse(body);

	        console.log(parsed);

			//global["world"] = parsed;
	    });
	}
).end();
*/

//console.log(JSON.stringify(user))

//post_req.write(JSON.stringify(user));
//post_req.end();

/*
if(process.argv.length < 3) {
	console.log("ERROR: Please provide a username. For example: \"npm start john\" for the username \"john.\"");
	exit(1);
}
else {
	global["player"].name = process.argv[2];
}
*/

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 1422, height: 800});

	// and load the index.html of the app.
	mainWindow.loadURL('file://' + __dirname + '/index.html');

	// Open the DevTools.
	//mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
	createWindow();
});

setInterval(function(){
	console.log(server.url);
	console.log(global["player"].name);
	if(server.url != "") {
		console.log(server.url);
		positionSync();
		worldSync();
	}
}, 500);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

function positionSync() {
	if (global["player"].name == "") {
		http.get(
			server.url+"/world", function(response) {
			    // Continuously update stream with data
			    var body = '';
			    response.on('data', function(d) {
					//console.log(d);
			        body += d;
			    });
			    response.on('end', function() {

			        // Data reception is done, do whatever with it!
			        var parsed = JSON.parse(body);

			        //console.log(parsed);

					global["world"] = parsed;
			    });
			}
		).end();
	}
	else {
		request.post(
		    server.url+'/user',
		    {
				form:
					{
						name: JSON.stringify(player)
					}
			},
		    function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		            global["users"] = JSON.parse(response.body);
					console.log(users);
		        }
		    }
		);
	}
}

function worldSync() {
	http.get(
		server.url+"/world", function(response) {
		    // Continuously update stream with data
		    var body = '';
		    response.on('data', function(d) {
				//console.log(d);
		        body += d;
		    });
		    response.on('end', function() {

		        // Data reception is done, do whatever with it!
		        var parsed = JSON.parse(body);

		        //console.log(parsed);

				global["world"] = parsed;
				global["synced"] = true;
		    });
		}
	).end();
}
