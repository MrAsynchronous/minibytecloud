//Load express module with `require` directive
var express = require('express');
var app = express();

//Define port
var port = 3000;

//Define request response in root URL (/)
app.get('/', function (req, res) {
	res.send("Reached MiniBytesCloud!");
});

app.get('/signin', (req, res) => {
	res.send("Reached /signin!");
});

app.get('/signup', (req, res) => {
	res.send("Reached /signup!");
});

//Launch listening server on port 3000
app.listen(port, function () {
	console.log(`app listening on port ${port}!`)
})