const mongoose = require('mongoose');

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
	comments: [{body: String, author_user_id: String, date: Date}],
	date: {type: Date, default: Date.now},
	meta: {
		votes: Number
	}
});

module.exports = {
	User: mongoose.model('User', userSchema),
	Byte: mongoose.model('Byte', byteSchema)
}