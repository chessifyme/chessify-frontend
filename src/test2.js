const WebSocket = require('ws');
const readline = require('readline');

var socket = new WebSocket('wss://chessify.me/ws/user_balance/tavetius/');

socket.onmessage = function (event) {
	var data = JSON.parse(event.data);
	console.log(data);
};

socket.onerror = function (event) {
	console.error('WebSocket error:', event.error);
};

socket.onclose = function (event) {
	console.log('WebSocket closed:', event.code, event.reason);
};

// Create a readline interface for reading user input from the console