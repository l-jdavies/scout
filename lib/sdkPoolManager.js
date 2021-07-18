class SDKPoolManager { // manages the list of sdks that have an SSE connection with scout
  constructor(sdkKey) {
    this._clients = [];
    this._sdkKey = sdkKey;
  }

  addClient(client) {
    this._clients.push(client);
  }
  
  sendEventsToAll(payload) {
    const data = {
      eventType: "ALL_FEATURES",
      payload
    }
  
    this._clients.forEach(client => client.response.write(`data: ${JSON.stringify(data)}\n\n`))
  }

  removeAllClients() {
    this._clients = [];
  }

  removeClient(clientToRemove) {
    const clientId = clientToRemove.id;
    this._clients = this._clients.filter(client => client.id !== clientId);
  }

  getSdkKey() {
    return this._sdkKey;
  }

  updateSdkKey(sdkKey) {
    this._sdkKey = sdkKey;
  }
  
  checkValidKey(authorizationKey) {
    return this._sdkKey === authorizationKey;
  }
}

const sdkPoolManager = new SDKPoolManager();
module.exports = sdkPoolManager;