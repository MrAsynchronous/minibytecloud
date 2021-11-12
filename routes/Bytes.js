const express = require('express');
const Filter = require('bad-words');
const mongoSchemas = require('../MongoSchemas');

const router = express.Router();
const filter = new Filter();

const User = mongoSchemas.User;
const Byte = mongoSchemas.Byte;

function isValidByteRequest(byte) {
	return (byte.user_id && byte.user_id.toString().trim() !== '' &&
	byte.body && byte.body.toString().trim() !== '');
}

router.get('/', (request, response) => {
	response.json({
		message: "You've reached /bytes.",
		api: ["/post", "/fetch"]
	});
});

router.post('/upvote', (request, response) => {

});

router.post('/comment', (request, response) => {

});

router.post('/post', (request, response) => {

	if (isValidByteRequest(request.body)) {

		// Check for user in DB
		User
			.find({
				user_id: request.body.user_id
			})
			.then(doc => {
				console.log(doc);

				// Check if user exists
				if (doc.length >= 1) {
					var user = doc[0];

					var byte = new Byte({
						author_userid: request.body.user_id,
						body: filter.clean(request.body.body)
					})

					byte.save()
						.then(doc => {
							user.total_bytes += 1;

							user.save()
								.then(doc => {
									response.json({
										byte_id: doc._id
									});
								})
								.catch(err => {
									response.status(500);
									response.json({
										message: "Couldn't update bytes!",
										error: err 
									})
								})
						})
						.catch(err => {
							response.status(500);
							response.json({
								message: "Couldn't save byte!",
								error: err
							})
						});
				} else {
					response.status(422);
					response.json({
						message: "User not found!"
					})
				}
			})
			.catch(err => {
				response.status(422)
				response.json({
					message: "Couldn't validate user_id!",
					error: err
				});
			});
	} else {
		response.status(422);
		response.json({
			message: "Hey! User_id and body are required!"
		})
	}

});

router.get('/fetch', (request, response) => {

	// Fetch first 100 bytes, sort by date
	Byte.find()
		.limit(100)
		.sort({date: -1})
		.exec()
		.then(docs => {
			response.json({
				bytes: docs
			})
		})
		.catch(err => {
			response.status(422);
			response.json({
				message: "Couldn't query bytes!",
				error: err
			})
		})
});

module.exports = router