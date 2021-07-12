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
**6/30 2pm**
Currently, the application has an api endpoint `GET /ruleset`.

This ruleset function currently lives in `routes/index.js`.  The final product of our edge server will serve fresh data, but currently we are using a static json file that is in `lib/ruleset.json`.

When a `GET` request comes into the `/ruleset` endpoint, the application first authenticates the request.  The request must have an `Authorization` header with a value `JazzyElksRule` (you can test this out in postman).  If the header isn't present or doesn't have the correct value, an error is returned. If the header is present with the appropriate value, the json will be returned:

```
// the key of each object in 'flags' is the flagId.  I think using an object rather than an array is smart here because you'll want the SDK to be able to retrieve a flag's current status in constant time (quickly), rather than iterating through an array of flags looking for a matching id.
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
```
