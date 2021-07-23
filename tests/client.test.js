const Client = require("../lib/client")

describe("create new client", () => {
	const clientId = Date.now();
	const response = "test string";
	const sdkKey = "d56a8909-005f-46ad-ac33-2a0e92c0d15d";

	const testClient = new Client({id: clientId, response, authorizationKey: sdkKey})

	test("create client", () => {
		expect(typeof testClient).toBe('object');
		expect(typeof testClient.id).toBe('number');
		expect(typeof testClient.authorizationKey).toBe('string');
		expect(typeof testClient.write).toBe('function')
	})
});