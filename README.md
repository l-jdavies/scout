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
**7/12 part 2**
Tried to change the JetStream consumer configs so the push subscriber to `DATA.FullRuleSet` only receives a single message - the last message in the stream. However, after posting a message in the NATS slack, that doesn't seem to be possible.
![image](https://user-images.githubusercontent.com/50094605/125531488-2ee92e96-f3be-4204-a089-41532e72e4c1.png)

I tried to unsubscribe after one message but that mean't the subscription to `FullRuleSet` closed completely and meant that when changes were made on the `pioneer` GUI, messages weren't being received but `scout`.

**7/12**
Summary of current jetstream workflow:
* When SDK client initially connects:
    * The connection of an SDK client is handled by `scout/routes/index.js` function `eventsHandler`
    * Following the authorization of the SDK client, the jetstream function `fetchRecentData` is invoked
    * `fetchRecentData` publishes a jetstream message with the subject `DATA.FullRuleSetRequest`. This message is subscribed to by `pioneer` and triggers `pioneer` to send the full rule set by sending a message on the stream `DATA.FullRuleSet`
    * `scout` subscribes to messages from `DATA.FullRuleSet` and receiving a `FullRuleSet` message leads to the full rule set being sent to all connected SDK clients.
    * However, due to the time (less than a second) it takes for `scout` to receive the new data and send to clients, it means the SDK client is initially sent an empty data payload, which is immediately followed with the actual data
* When any flag changes occur on the `pioneer` GUI:
    * `pioneer` publishes a `DATA.FullRuleSet` message, which `scout` subscribes too
    * When a `FullRuleSet` message is received, the data is automatically sent to all connected SDK clients.

Options for optimising the SDK client initial connection workflow:
* Figure out how to make `scout` a pull subscriber of the `DATA.FullRuleSet` stream
    * This would enable the `fetchRecentData` `scout/jetstream` function to pull the latest message from the stream and that could be returned by `fetchRecentData`
    * I spent ages playing with this and although the pull subscription was set-up, I wasn't getting any messages
* Any other way of getting the most recent message from a stream?

**7/12**
The `scout` daemon needs the following interactions with JetStream:

* Publish requests with the subject `Data.FullRuleSetRequest` to request full data set from `pioneer` when an SDK client connection occurs
* Subscribe to `Data.FullRuleSetResponse`, which `pioneer` will send in response to receiving a `Data.FullRuleSetRequest` message.

