const { connect, StringCodec, consumerOpts, createInbox } = require('nats');
// const { updateSdkKey } = require("../routes/index");
const sdkPoolManager = require('../lib/sdkPoolManager');
// cannot import sendEventsToAll from index.js as that would result in a circular depency
const SUBSCRIPTION_SUBJECTS = require('./constants');

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

	// moved the below console logs to be called in the same place as the main handler functions
	// so we don't need to call subscriptionLog

	// subscriptionLog(subject) {
	//   return(
	//     async function(subscription) {
	//       for await (const msg of subscription) {
	//         msg.ack();
	//         console.log(`Data from ${subject} func; subject: ${msg.subject}: ${sc.decode(msg.data)}`);
	//       }
	//       console.log(`Subscription to ${subject} closed.`);
	//     }
	//   );
	// }

	_config(subject) {
		const opts = consumerOpts();
		opts.durable(subject);
		opts.manualAck();
		opts.ackExplicit();
		opts.deliverTo(createInbox());

		return opts;
	}

	async fetchRecentData() {
		// await this.publish('DATA.FullRuleSetRequest');
		await this.publish(SUBSCRIPTION_SUBJECTS.ruleset.fullSubject);
	}

	async fetchSdkKey() {
		// await this.publish('KEY.sdkKeyRequest');
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
		// await createJetStreamConnect();

		// const sub = await js.subscribe('DATA.FullRuleSet', config('FullRuleSet'));
		const handler = (m) => {
			console.log(`Ruleset received: ${this.sc.decode(m.data)}`);
			sdkPoolManager.sendEventsToAll(this.sc.decode(m.data));
		};
		this._subscribeToRequests({
			streamName : SUBSCRIPTION_SUBJECTS.ruleset.streamName,
			subsetName : SUBSCRIPTION_SUBJECTS.ruleset.subsetName,
			handler
		});

		// (async (sub) => {
		//   for await (const m of sub) {
		//     console.log(`Ruleset received: ${sc.decode(m.data)}`)
		//     i.sendEventsToAll(sc.decode(m.data));
		//     m.ack();
		//   };
		// })(sub);

		// subscriptionLog('FullRuleSet')(sub);
	}

	async _subscribeToSdkKey() {
		// await createJetStreamConnect();

		// const sub = await js.subscribe('KEY.sdkKey', config('sdkKey'));
		const handler = (m) => {
			const sdkKey = JSON.parse(this.sc.decode(m.data));
			console.log(`SDK key received: ${sdkKey}`);
			sdkPoolManager.updateSdkKey(sdkKey);
		};
		// this._subscribeToRequests({
		// 	streamName : SUBSCRIPTION_SUBJECTS.sdkKey.streamName,
		// 	subsetName : SUBSCRIPTION_SUBJECTS.sdkKey.subsetName,
		// 	handler
		// });
		this._subscribeToRequests({ streamName: 'KEY', subsetName: 'sdkKey', handler });

		// (async (sub) => {
		//   for await (const m of sub) {
		//     console.log(`SDK key received: ${sc.decode(m.data)}`)
		//     i.updateSdkKey(sc.decode(m.data));
		//     m.ack();
		//   };
		// })(sub);
	}

	async _initSubscribe() {
		await this._subscribeToFullRuleSet();
		await this._subscribeToSdkKey();
	}

	async publish(stream, msg) {
		// await createJetStreamConnect();

		const pubMsg = await this.js.publish(stream, this.sc.encode(msg));
		// const capStream = pubMsg.stream;
		// const msgSeq = pubMsg.seq;
	}
}

const jsw = new JetstreamWrapper();
module.exports = jsw;
