/*
	Brandon Wilcox
*/

const express = require('express');
const Filter = require('bad-words');
const { v4: uuidv4 } = require('uuid');
const profanity = require('profanity-util');
const mongoSchemas = require('../MongoSchemas');

const router = express.Router();
const filter = new Filter();

const User = mongoSchemas.User;

function isValidLoginRequest(user) {
	return (user.name && user.name.toString().trim() !== '' &&
		user.password && user.password.toString().trim() !== '');
}

function isValidSignupRequest(user) {
	return (user.name && user.name.toString().trim() !== '' &&
		user.password && user.password.toString().trim() !== '' &&
		user.bio && user.bio.toString().trim() !== '');
}

function isValidUserInfoRequest(req) {
	return (req.user_id && req.user_id.toString().trim() !== '')
}

// Landing
router.get('/', (req, res) => {
	res.json({
		message: `You've reached ${req.originalUrl}`,
		available_api: ["GET /login", "POST /signup"]
	});
});

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
router.post('/login', async (req, res) => {
	var body = req.body;

	// Validate request body
	if (!isValidLoginRequest(body)) {
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
	Returns the user infor for a user_id

	req = {
		user_id: String
	}

	res = {
		user_info: Object
	}
*/
router.post('/getuserinfo', async (req, res) => {
	var body = req.body;

	// Validate request
	if (!isValidUserInfoRequest(body)) {
		return res.json({ message: "Must provide a user_id!" });
	}

	// Query DB to find user
	var queryResult = await User
		.find({
			user_id: body.user_id
		});

	// Validate user existance
	if (queryResult.length == 0) {
		return res.json({ message: "User not found!" });
	}

	// Localize user data
	var userData = queryResult[0];

	// Clean user data
	var cleanedUserData = {
		name: userData.name,
		bio: userData.bio,
		total_bytes: userData.total_bytes,
		total_upvotes: userData.total_upvotes
	}

	return res.json({ user_info: cleanedUserData });
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
	if (!isValidSignupRequest(body)) {
		return res.json({ message: "Must provide name, bio and password!" });
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
		bio: filter.clean(body.bio),
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