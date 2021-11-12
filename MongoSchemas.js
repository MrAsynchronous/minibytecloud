const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	body: String,
	author_userid: String,
	date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
	name: String,
	password: String,
	user_id: String,
	total_bytes: { type: Number, default: 0 },
	total_upvotes: { type: Number, default: 0 },
});

const byteSchema = new mongoose.Schema({
	author_userid: String,
	body: String,
	comments: { type: [commentSchema], default: [] },
	date: {type: Date, default: Date.now},
	votes: { type: Number, default: 0 }
});

module.exports = {
	User: mongoose.model('User', userSchema),
	Byte: mongoose.model('Byte', byteSchema)
}