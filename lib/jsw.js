const { connect, StringCodec, consumerOpts, createInbox } = require('nats');
const sdkPoolManager = require('../lib/sdkPoolManager');
const SUBSCRIPTION_SUBJECTS = require('./constants');
// cannot import sendEventsToAll from index.js as that would result in a circular depency

class JetstreamWrapper {
	constructor() {
		this.sc = StringCodec();
	}

	async init() {
		await this._createJetStreamConnect();
		await this._initSubscribe();
		await this.fetchSdkKey();
	}

	async _createJetStreamConnect() {
		this.nc = await connect({ servers: 'localhost:4222' });
		this.js = this.nc.jetstream();
	}

	_config(subject) {
		const opts = consumerOpts();
		opts.durable(subject);
		opts.manualAck();
		opts.ackExplicit();
		opts.deliverTo(createInbox());

		return opts;
	}

	async fetchRecentData() {
		await this.publish(SUBSCRIPTION_SUBJECTS.ruleset.fullSubject);
	}

	async fetchSdkKey() {
		await this.publish(SUBSCRIPTION_SUBJECTS.sdkKey.fullSubject);
	}

	async _subscribeToRequests({ streamName, subsetName, handler }) {
		const sub = await this.js.subscribe(`${streamName}.${subsetName}`, this._config(subsetName));

		(async (sub) => {
			for await (const m of sub) {
				handler.call(this, m); // make sure it's calling the right context
				m.ack();
				console.log(`Data from ${subsetName} func; subject: ${m.subject}: ${this.sc.decode(m.data)}`);
			}
			console.log(`Subscription to ${subject} closed.`);
		})(sub);
	}

	async _subscribeToFullRuleSet() {
		const handler = (m) => {
			console.log(`Ruleset received: ${this.sc.decode(m.data)}`);
			sdkPoolManager.sendEventsToAll(this.sc.decode(m.data));
		};
		this._subscribeToRequests({
			streamName : SUBSCRIPTION_SUBJECTS.ruleset.streamName,
			subsetName : SUBSCRIPTION_SUBJECTS.ruleset.subsetName,
			handler
		});
	}

	async _subscribeToSdkKey() {
		const handler = (m) => {
			const sdkKey = JSON.parse(this.sc.decode(m.data));
			console.log(`SDK key received: ${sdkKey}`);
			sdkPoolManager.updateSdkKey(sdkKey);
		};
		this._subscribeToRequests({
			streamName : SUBSCRIPTION_SUBJECTS.sdkKey.streamName,
			subsetName : SUBSCRIPTION_SUBJECTS.sdkKey.subsetName,
			handler
		});
	}

	async _initSubscribe() {
		await this._subscribeToFullRuleSet();
		await this._subscribeToSdkKey();
	}

	async publish(stream, msg) {
		const pubMsg = await this.js.publish(stream, this.sc.encode(msg));
		// const capStream = pubMsg.stream;
		// const msgSeq = pubMsg.seq;
	}
}

const jsw = new JetstreamWrapper();
module.exports = jsw;
