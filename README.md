## Purpose
Daemon is set up as a subscriber of NATS messages from the `FLAG` stream. Currently, the app doesn't do anything with the messages, they are just logged within the terminal.

## Setup
Within the root directory: `npm install`.

## Run the app
`npm run`

App will run on `localhost:3030`.

This application should be subscribed to a NATS server in order to receive messages from the monolith app. See below for how to start NATS:

### To connect with nats server

Ensure Docker is running then `docker pull nats` to pull nats server.

To run server in detached mode: `docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats`

To stop the docker container when finished with server:
```
// get container ID
docker ps
docker stop <container ID>
```

### Development notes
**7/12**
The `scout` daemon needs the following interactions with JetStream:

* Publish requests with the subject `Data.FullRuleSetRequest` to request full data set from `pioneer` when an SDK client connection occurs
* Subscribe to `Data.FullRuleSetResponse`, which `pioneer` will send in response to receiving a `Data.FullRuleSetRequest` message.

