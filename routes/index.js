const express = require('express');
const router = express.Router();
const jsw = require('../lib/jsw');
const sdkPoolManager = require('../lib/sdkPoolManager');
const Client = require('../lib/client');

const headers = {
	'Content-Type'  : 'text/event-stream',
	Connection      : 'keep-alive',
	'Cache-Control' : 'no-cache'
};

/*
Note that this route should not be available unless someone
requests with a valid key for security reasons.
*/

async function eventsHandler(request, response, next) {
	const authHeader = request.get('Authorization');

	if (!sdkPoolManager.checkValidKey(authHeader)) {
		return response.status(500).send({
			message : 'Invalid authentication key'
		});
	}

	console.log(request.get('Authorization'));
	response.writeHead(200, headers);

	const clientId = Date.now();

	const newClient = new Client({
		id               : clientId,
		response,
		authorizationKey : authHeader
	});

	sdkPoolManager.addClient(newClient);

	request.on('close', () => {
		console.log(`${clientId} Connection closed`);
		sdkPoolManager.removeClient(newClient);
	});

	const init = {
		eventType : 'CREATE_CONNECTION',
		payload   : []
	};
	await jsw.fetchRecentData();

	// initial payload is empty
	console.log('SDK client connected');
	newClient.write(`data: ${JSON.stringify(init)}\n\n`);
}
router.get('/features', eventsHandler);

exports.indexRouter = router;
