const express = require('express');
const Filter = require('bad-words');
const mongoose = require('mongoose');
const mongoSchemas = require('../MongoSchemas');

const router = express.Router();
const filter = new Filter();

const User = mongoSchemas.User;

// Create connection to MongoDb
createMongoConnection().catch((err) => console.log(err));

// Helper function to create connection to mongoDB
async function createMongoConnection() {
	var username = process.env.MONGOUSERNAME;
	var password = process.env.MONGOPASSWORD;

	await mongoose.connect(`mongodb+srv://${username}:${password}@minibytesdb.km9ra.mongodb.net/minibytesdb?retryWrites=true&w=majority`);
}

// Returns true if signup is valid
function isValidUserRequest(user) {
	return  (user.name && user.name.toString().trim() !== '' &&
		user.password && user.password.toString().trim() !== '');
}

router.get('/', (request, response) => {
	response.json({
		message: "You've reached /users.",
		api: ["/login", "/signup"]
	});
});

// Logs a user in
router.get('/login', (request, response) => {
	// Validate request
	if (isValidUserRequest(request.body)) {
		// Find user in DB
		User
			.find({
				name: request.body.name
			})
			.then(doc => {
				
				// Check if user exists
				if (doc.length >= 1) {
					var user = doc[0];

					// Compare passwords
					if (user.password == request.body.password) {

						// Respond with user_id
						response.json({
							user_id: user._id
						})
					} else {
						response.status(422);
						response.json({
							message: "Incorrect password!"
						});
					}
				} else {
					response.status(422);
					response.json({
						message: "User not found!"
					});
				}
			})
			.catch(err => {
				
				response.status(422);
				response.json({
					message: "Couldn't check user existance!",
					error: err
				});
			});
	} else {
		response.status(422);
		response.json({
			message: 'Hey! Username and password are required!'
		});
	}
});

// Signs up a new user
router.post('/signup', (request, response) => {
	// Validate request
	if (isValidUserRequest(request.body)) {

		// Check if user already exists
		User
			.find({
				name: request.body.name
			})
			.then(doc => {
				
				// Check if user exists in doc
				if (doc.length > 0) {
					response.status(422);
					response.json({
						message: "User already exists!"
					});
				} else {
					// Generate new user object
					var user = new User({
						name: filter.clean(request.body.name),
						password: request.body.password
					})
					
					// Save user and return user_id
					user.save()
						.then(doc => {
							response.json({
								username: doc.name,
								user_id: doc._id
							});
						})
						.catch(err => {
							response.status(500);
							response.json({
								message: "Couldn't save user!",
								error: err
							})
						});
				}
			})
			.catch(err => {
				response.status(500);
				response.json({
					message: "Couldn't check user existance!",
					error: err
				});
			});
	} else {
		response.status(422);
		response.json({
			message: 'Hey! Username and password are required!'
		});
	}
});

module.exports = router