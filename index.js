//Load express module with `require` directive
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

// Dependency usage
app.use(cors());
app.use(express.json());

// Routing
app.use('/users', require('./routes/Users'));
app.use('/bytes', require('./routes/Bytes'));

// Launch cloud on port
app.listen(port, function () {
	console.log(`MiniBytes cloud running on port: ${port}!`)
});