const Client = require("../lib/client");
const sdkPoolManager = require("../lib/sdkPoolManager");

describe("test sdkPoolManager", () => {
	const clientId = "12345";
	const clientId2 = "abcdef";
	const response = "test string";
	const sdkKey = "d56a8909-005f-46ad-ac33-2a0e92c0d15d";

	const testClient = new Client({id: clientId, response, authorizationKey: sdkKey});
	const testClient2 = new Client({id: clientId2, response, authorizationKey: sdkKey});
	
	afterEach(() => {
		sdkPoolManager.removeAllClients();
		sdkPoolManager._sdkKey = "";
	});

	test("add new client", () => {
		expect(sdkPoolManager._clients).toEqual([])
		sdkPoolManager.addClient(testClient);
		expect(sdkPoolManager._clients).toEqual([testClient]);
	});

	test("remove single client", () => {
		sdkPoolManager.addClient(testClient);
		sdkPoolManager.addClient(testClient2);
		sdkPoolManager.removeClient(testClient);
		expect(sdkPoolManager._clients).toEqual([testClient2]);
	});

	test("remove all clients", () => {
		sdkPoolManager.addClient(testClient);
		sdkPoolManager.addClient(testClient2);
		sdkPoolManager.removeAllClients();
		expect(sdkPoolManager._clients).toEqual([]);	
	});

	test("get sdk key", () => {
		sdkPoolManager._sdkKey = sdkKey;
		expect(sdkPoolManager.getSdkKey()).toEqual(sdkKey);
	});

	test("update sdk key", () => {
		sdkPoolManager._sdkKey = sdkKey;
		const newSdkKey = "a1bd336a-84f2-4126-8496-3dd1fcf525ec";
		sdkPoolManager.updateSdkKey(newSdkKey);
		expect(sdkPoolManager.getSdkKey()).toEqual(newSdkKey);
	});

	test("check sdk key is valid", () => {
		sdkPoolManager._sdkKey = sdkKey;
		expect(sdkPoolManager.checkValidKey(sdkKey)).toEqual(true);
	});

	test("check invalid sdk key", () => {
		sdkPoolManager._sdkKey = sdkKey;
		const newSdkKey = "a1bd336a-84f2-4126-8496-3dd1fcf525ec";
		expect(sdkPoolManager.checkValidKey(newSdkKey)).toEqual(false);
	});
})