<p align="center">
    <img src="https://user-images.githubusercontent.com/19399698/126998779-e3bc3a2d-0e2a-4353-8f3e-9aa857455fe5.png" alt="Pioneer logo" width="200" height="200">
</p>

# Scout

Scout is a daemon that serves feature flag data from Compass to connected SDK clients, as part of the Pioneer feature flag management architecture. For more information, visit Pioneer's case study page.

## Usage
Scout is set up as a subscriber of NATS messages from the `DATA` and `KEY` streams. The `DATA` stream is used to receive updated feature flag rulesets from [Compass](https://github.com/pioneer-io/compass/blob/main/README.md). They `KEY` stream is used to receive the current valid SDK key from Compass.

Pioneer's SDK clients (installed in the user application) will request to connect to Scout as server-sent event clients.  Scout will verify the legitimacy of the SDK client via the SDK key.  Once authenticated, Scout will transmit up-to-date feature flag rulesets to the SDKs via server-sent events.


## Setup
Within the root directory: `npm install`.

## Run the app individually
`npm start`

App will run on port `:3030`.

This application should be subscribed to a NATS server in order to receive messages from Compass app. See below for how to start NATS:

### To connect with nats server

Ensure Docker is running then `docker pull nats` to pull nats server.

To run server in detached mode: `docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats --js`

To stop the docker container when finished with server:
```
// get container ID
docker ps
docker stop <container ID>
```

