const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	author_userid: String,
	body: String,
	date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
	name: String,
	password: String,
	user_id: String,

	bio: String,
	total_bytes: { type: Number, default: 0 },
	total_upvotes: { type: Number, default: 0 },
});

const byteSchema = new mongoose.Schema({
	author_userid: String,
	body: String,
	date: Number,
	comments: [commentSchema],
	votes: {
		count: { type: Number, default: 0 },
		users: []
	}
});

module.exports = {
	User: mongoose.model('User', userSchema),
	Byte: mongoose.model('Byte', byteSchema),
	Comment: mongoose.model('Comment', commentSchema)
}