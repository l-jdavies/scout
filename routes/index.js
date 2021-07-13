const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const {getSingleMessage} = require("../lib/jetstream")

const hiPayload = {
  key: "hi",
  value: "false"
}

/*
Note that this route should not be available unless someone
requests with a valid key for security reasons.
*/
const validKey = (authHeader) => {
  const dummyAuthenticator = "JazzyElksRule"
  return authHeader === dummyAuthenticator;
}

function eventsHandler(request, response, next) {
  const authHeader = request.get("Authorization");

  if (!validKey(authHeader)) {
    return res.status(500).send({
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

  // const data = `data: ${JSON.stringify(facts)}\n\n`;

  // response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });

  const init = {
    eventType: "FEATURE_UPDATES",
    payload: hiPayload
  }

  console.log("New client added");
  getSingleMessage();
  // newClient.response.write(`data: ${JSON.stringify(init)}\n\n`)
}



router.get('/ruleset', function (req, res, next) {
  const authHeader = req.get('Authorization');
  if (!validKey(authHeader)) {
    return res.status(500).send({
      message: 'Invalid authentication key'
    });
  }

  // here we need to be able to get the updated ruleset
  // when the SDK demands. this could be from a cache.

  // for now, there's a static ruleset.json file
  // in the lib dir.
  res.sendFile(path.join(__dirname, '../lib', '/ruleset.json'));
});

function sendEventsToAll(payload) {
  const data = {
    eventType: "FEATURE_UPDATE",
    payload
  }

  console.log("data sent to clients: ", data);
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(data)}\n\n`))
}

router.get('/features', eventsHandler);

router.put('/features/hi', function(req, res, next) {
  hiPayload.value = !hiPayload.value;
  sendEventsToAll(hiPayload);

  res.write(`sent ${hiPayload.value}`);
  res.end();
})

let clients = [];

exports.indexRouter = router;
exports.sendEventsToAll = sendEventsToAll;

/*
Tested above route in postman:
{
  "flags": {
    "1234": {
      "toggledOn": true,
      "title": "flag 1",
      "createdOn": "2021-06-28"
    },
    "5678": {
      "toggledOn": false,
      "title": "flag 2",
      "createdOn": "2021-06-29"
    },
    "9101112": {
      "toggledOn": false,
      "title": "flag 3",
      "createdOn": "2021-06-30"
    }
  }
}
*/
