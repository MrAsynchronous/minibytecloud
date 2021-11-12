const express = require('express');
const { v4: uuidv4 } = require('uuid');
const profanity = require('profanity-util');
const mongoSchemas = require('../MongoSchemas');

const router = express.Router();

const User = mongoSchemas.User;

// Returns true if signup is valid
function isValidUserRequest(user) {
	return (user.name && user.name.toString().trim() !== '' &&
		user.password && user.password.toString().trim() !== '');
}

// Landing
router.get('/', (req, res) => {
	res.json({
		message: `You've reached ${req.originalUrl}`,
		available_api: ["GET /login", "POST /signup"]
	});
});

// POST wildcard
router.post('*', (req,res) => {
	res.json({
		message: `POST ${req.originalUrl} is not a valid REST Endpoint!`
	})
});

// GET wildcard
router.get('*', (req, res) => {
	res.json({
		message: `GET ${req.originalUrl} is not a valid REST Endpoint!`
	});
})

/*
	Logs a user in.

	req = {
		name: String,
		password: String (hash only)
	}

	res = {
		user_id: String
	}
*/
router.get('/login', async (req, res) => {
	var body = req.body;

	// Validate request body
	if (!isValidUserRequest(body)) {
		return res.json({ message: "Must provide name and password!" });
	}

	// Query user name in DB
	var queryResult = await User
		.find({
			name: body.name
		})

	// Validate user existance
	if (queryResult.length == 0) {
		return res.json({ message: "User not found!" });
	}
	
	// Localize user information
	var userData = queryResult[0];

	// Compare passwords
	if (userData.password != body.password) {
		return res.json({ message: "Wrong password!" });
	}

	// Return userid
	res.json({ user_id: userData.user_id })
})

/*
	Signs a new user up. 

	req = {
		name: String,
		password: String (hash only)
	}

	res = {
		user_id: String
	}
*/
router.post('/signup', async (req, res) => {
	var body = req.body;

	// Validate request body
	if (!isValidUserRequest(body)) {
		return res.json({ message: "Must provide name and password!" });
	}

	// Query user name in DB
	var queryResult = await User
		.find({
			name: body.name
		})

	// Check for bad username
	if (profanity.check(body.name).length > 0) {
		return res.json({ message: "Inappropriate username!" });
	}

	// Only one username can exist
	if (queryResult.length > 0) {
		var user = queryResult[0];

		// Give notice to user that they already have an account
		if (user.password == body.password) {
			return res.json({ message: "Looks like you already have an account!  Please login!" });
 		} else {
			return res.json({ message: "Username taken!" });
		}
	}

	// Construct new user model
	var user = new User({
		name: body.name,
		password: body.password,
		user_id: uuidv4()
	})

	// Save user to db
	await user
		.save()
		.then(doc => {
			return res.json({ user_id: doc.user_id });
		})
		.catch(err => {
			return res.json({ message: "Couldn't save user!", error: err });
		})
})

module.exports = router