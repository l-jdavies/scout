class Client {
  constructor({ id, response, authorizationKey }) {
    this.id = id;
    this.response = response;
    this.authorizationKey = authorizationKey;
  }

  write(data) {
    this.response.write(data);
  }
}

module.exports = Client;