const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
// const {fetchRecentData, fetchSdkKey} = require("../lib/jetstream")
const jsw = require("../lib/jsw");
const sdkPoolManager = require("../lib/sdkPoolManager");

let clientSdkKey;
/*
Note that this route should not be available unless someone
requests with a valid key for security reasons.
*/
// const validKey = async (authHeader) => {
//   await jsw.fetchSdkKey();
//   const auth = `"${authHeader}"`
//   return auth === clientSdkKey;
// }

async function eventsHandler(request, response, next) {
  const authHeader = request.get("Authorization");

  if (! sdkPoolManager.checkValidKey(authHeader)) {
    return response.status(500).send({
      message: 'Invalid authentication key'
    });
  }
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  console.log(request.get("Authorization"));
  response.writeHead(200, headers);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };

  sdkPoolManager.addClient(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    // clients = clients.filter(client => client.id !== clientId);
    sdkPoolManager.removeClient(newClient);
  });

  const init = {
    eventType: "CREATE_CONNECTION",
    payload: []
  }
  await jsw.fetchRecentData();
  
  // initial payload is empty
  console.log("SDK client connected")
  newClient.response.write(`data: ${JSON.stringify(init)}\n\n`);
}

// function sendEventsToAll(payload) {
//   const data = {
//     eventType: "ALL_FEATURES",
//     payload
//   }

//   clients.forEach(client => client.response.write(`data: ${JSON.stringify(data)}\n\n`))
// }

// function updateSdkKey(newKey) {
//   clientSdkKey = newKey;
// }

router.get('/features', eventsHandler);

router.put('/features/hi', function(req, res, next) {
  hiPayload.value = !hiPayload.value;
  // sendEventsToAll(hiPayload);

  res.write(`sent ${hiPayload.value}`);
  res.end();
})

let clients = [];

exports.indexRouter = router;
// exports.sendEventsToAll = sendEventsToAll;
// exports.updateSdkKey = updateSdkKey;
