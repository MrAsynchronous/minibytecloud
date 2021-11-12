//Load express module with `require` directive
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// Load local ENV
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// Create express app instance
const app = express();

// Port definition
var port = process.env.PORT || 3000;

// Create connection to MongoDb
createMongoConnection().catch((err) => console.log(err));

// Helper function to create connection to mongoDB
async function createMongoConnection() {
	var username = process.env.MONGOUSERNAME;
	var password = process.env.MONGOPASSWORD;

	await mongoose.connect(`mongodb+srv://${username}:${password}@minibytesdb.km9ra.mongodb.net/minibytesdb?retryWrites=true&w=majority`);
}

// Dependency usage
app.use(cors());
app.use(express.json());

// Routing
app.use('/users', require('./routes/Users'));
app.use('/bytes', require('./routes/Bytes'));

app.get('/', (req, res) => {
	res.json({
		message: "You've reached the API of minibytes!"
	})
})

// Launch cloud on port
app.listen(port, function () {
	console.log(`MiniBytes cloud running on port: ${port}!`)
});