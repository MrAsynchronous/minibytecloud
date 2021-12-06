/*
	Brandon Wilcox
*/

const express = require('express');
const Filter = require('bad-words');
const mongoose = require('mongoose');
const mongoSchemas = require('../MongoSchemas');

const router = express.Router();
const filter = new Filter();

const User = mongoSchemas.User;
const Byte = mongoSchemas.Byte;
const Comment = mongoSchemas.Comment;

function isValidByteRequest(byte) {
	return (byte.user_id && byte.user_id.toString().trim() !== '' &&
		byte.body && byte.body.toString().trim() !== '');
}

function isValidUpvoteRequest(req) {
	return (req.byte_id && req.byte_id.toString().trim() !== '' &&
		req.user_id && req.user_id.toString().trim() !== '')
}

function isValidCommentRequest(req) {
	return (req.byte_id && req.byte_id.toString().trim() !== '' &&
		req.user_id && req.user_id.toString().trim() !== '' &&
		req.body && req.body.toString().trim() !== '')
}

router.get('/', (request, response) => {
	response.json({
		message: "You've reached /bytes.",
		api: ["POST /post", "POST /upvote", "POST /comment", "GET /fetch"]
	});
});

/*
	Posts a new byte

	req = {
		user_id: String
		body: String
	}
*/
router.post('/post', async (req, res) => {
	var body = req.body;

	// Validate request body
	if (!isValidByteRequest(body)) {
		return res.json({ message: "Must provide body and user_id!" });
	}

	// Validate length
	if (body.body.length > 128) {
		return res.json({ message: `Byte body is too long! ${body.body.length - 128} characters too long!` });
	}

	// Query user_id in db
	var queryResult = await User
		.find({
			user_id: body.user_id
		});

	// Validate user existance
	if (queryResult.length == 0) {
		return res.json({ message: "User not found!" });
	}

	// Localize user information
	var user = queryResult[0];

	// Construct new byte
	var byte = new Byte({
		author_userid: user.user_id,
		body: filter.clean(body.body),
		date: Date.now()
	});

	// Update user byte count
	user.total_bytes += 1;

	// Save user changes
	await user
		.save()
		.catch(err => {
			console.log("Couldn't save total_bytes!", err);
		})

	// Save byte
	await byte
		.save()
		.then(doc => {
			return res.json({ byte_id: doc._id });
		})
		.catch(err => {
			return res.json({ message: "Couldn't save byte!", error: err });
		})
});

/*
	Upvotes a byte

	req = {
		user_id: String
		byte_id: String
	}

	res = {
		byte_id: String
		upvote_count: 1
	}
*/
router.post('/upvote', async (req, res) => {
	var body = req.body;

	// Validate request
	if (!isValidUpvoteRequest(body)) {
		return res.json({ message: "Must provide byte_id and user_id" });
	}

	// Query DB for byte
	var queryResult = await Byte
		.find({
			_id: mongoose.Types.ObjectId(body.byte_id)
		});
	
	// Validate byte existance
	if (queryResult.length == 0) {
		return res.json({ message: "Invalid byte!" });
	}

	// Localize byte
	var byte = queryResult[0];

	// Make sure users can't upvote multiple times
	if (byte.votes.users.includes(body.user_id)) {
		return res.json({ message: "Byte already upvoted!", byte_id:byte._id, upvote_count: byte.votes.count });
	}

	// Get information about byte author
	var userQueryResult = await User
		.find({
			user_id: byte.author_userid
		});

	// Localize author
	var author = userQueryResult[0];

	// Update byte information
	byte.votes.count += 1;
	byte.votes.users.push(body.user_id)

	// Update author information
	author.total_upvotes += 1;

	// Update byte in DB
	await byte
		.save()
		.then(doc => {

			// Save author information
			author
				.save()
				.then(() => {
					return res.json({ byte_id:byte._id, upvote_count: doc.votes.count });
				});
		})
		.catch(err => {
			return res.json({ message: "Couldn't upvote byte!", error: err });
		});
});

router.post('/comment', async (req, res) => {
	var body = req.body;

	// Validate request
	if (!isValidCommentRequest(body)) {
		return res.json({ message: "Must provide byte_id and body" });
	}

	// Validate length
	if (body.body.length > 128) {
		return res.json({ message: `Byte body is too long! ${body.body.length - 128} characters too long!` });
	}

	// Query DB for byte
	var queryResult = await Byte
		.find({
			_id: mongoose.Types.ObjectId(body.byte_id)
		})
	
	// Validate byte existance
	if (queryResult.length == 0) {
		return res.json({ message: "Invalid byte!" });
	}

	// Localize byte
	var byte = queryResult[0];

	// Construct a new comment
	var comment = new Comment({
		author_userid: body.user_id,
		body: filter.clean(body.body)
	});

	// Insert comment into byte
	byte.comments.push(comment)

	// Update byte in DB
	await byte
		.save()
		.then(doc => {
			return res.json({ byte_id:byte._id, comments: doc.comments });
		})
		.catch(err => {
			return res.json({ message: "Couldn't upvote byte!", error: err });
		});
});

/*
	Fetches the first 100 bytes

	req = {

	}

	res = {
		bytes: [Byte]
	}
*/
router.get('/fetch', async (req, res) => {
	// Fetch first 100 bytes, sort by date
	var queryResult = await Byte.find()
		.limit(100)
		.sort({date: -1})
		.exec()

	var bytes = [];

	for (let i = 0; i < queryResult.length; i++) {
		var byte = queryResult[i];

		// Query DB to find user
		var userQueryResult = await User
			.find({
				user_id: byte.author_userid
			});

		// Validate user existance
		if (userQueryResult.length == 0) {
			continue;
		}

		// Localize user data
		var userData = userQueryResult[0];

		var combinedInfo = {
			votes: byte.votes,
			_id: byte._id,
			author_userid: byte.author_userid,
			body: byte.body,
			date: byte.date,
			author_userdata: {
				name: userData.name,
				bio: userData.bio,
				total_bytes: userData.total_bytes,
				total_upvotes: userData.total_upvotes
			}
		}

		bytes.push(combinedInfo);
	}

	return res.json({ bytes: bytes });
});

module.exports = router