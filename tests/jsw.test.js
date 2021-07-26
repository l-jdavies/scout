const jsw = require("../lib/jsw");

describe("testing jetstream wrapper", () => {
	
	test("wrapper contains all expected methods", () => {
		expect(typeof jsw.init).toBe('function');
		expect(typeof jsw._createJetStreamConnect).toBe('function');
		expect(typeof jsw._config).toBe('function');
		expect(typeof jsw.fetchRecentData).toBe('function');
		expect(typeof jsw.fetchSdkKey).toBe('function');
		expect(typeof jsw._subscribeToFullRuleSet).toBe('function');
		expect(typeof jsw._subscribeToSdkKey).toBe('function');
		expect(typeof jsw._initSubscribe).toBe('function');
		expect(typeof jsw.publish).toBe('function');
	})

	test("wrapper contains expected properties", () => {
		expect(typeof jsw.sc).toBe('object');
	})
})