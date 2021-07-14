const { connect, StringCodec, consumerOpts, createInbox } = require('nats');
const sc = StringCodec();
const index = require("../routes/index");
let nc;
let js;

async function createJetStreamConnect() {
  nc = await connect({ servers: "localhost:4222" });
  js = nc.jetstream();
}

function subscriptionLog(subject) {
  return(
    async function(subscription) {
      for await (const msg of subscription) {
        msg.ack();
        console.log(`Data from ${subject} func; subject: ${msg.subject}: ${sc.decode(msg.data)}`);
      }
      console.log(`Subscription to ${subject} closed.`);
    }
  );
}

function config(subject) {
  const opts = consumerOpts();
  opts.durable(subject);
  opts.manualAck();
  opts.ackExplicit();
  opts.deliverTo(createInbox());

  return opts
}

async function fetchRecentData() {
  await publish('DATA.FullRuleSetRequest');
}

async function subscribeToFullRuleSet() {
  await createJetStreamConnect();

  const sub = await js.subscribe('DATA.FullRuleSet', config('FullRuleSet'));

  (async (sub) => {
    for await (const m of sub) {
      console.log(`Message received: ${sc.decode(m.data)}`)
      index.sendEventsToAll(sc.decode(m.data));
      m.ack();
    };
  })(sub);

  subscriptionLog('FullRuleSet')(sub);
}

async function initSubscribe() {
  subscribeToFullRuleSet();
}

async function publish(stream, msg) {
  await createJetStreamConnect();

  const pubMsg = await js.publish(stream, sc.encode(msg));
  const capStream = pubMsg.stream;
  const msgSeq = pubMsg.seq;

  await nc.drain();
}

exports.initSubscribe = initSubscribe;
exports.publish = publish;
exports.fetchRecentData = fetchRecentData;