const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
	response.json({
		message: "You've reached /bytes.",
		api: ["/post", "/fetch"]
	});
});

router.get('/post', (request, response) => {
	response.json({
		message: "You've reached /bytes/post!"
	});
});

router.get('/fetch', (request, response) => {
	response.json({
		message: "You've reached /bytes/fetch!"
	});
});

module.exports = router