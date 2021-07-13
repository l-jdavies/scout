const { connect, StringCodec, consumerOpts, createInbox } = require('nats');
const sc = StringCodec();
const index = require("../routes/index");

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


async function getSingleMessage() {
  const nc = await connect({ servers: "localhost:4222" });
  const js = await nc.jetstream();

  let msg = js.pull('FullRuleSet');
  msg.ack()

  console.log(`Single msg: ${sc.decode(msg.data)}`);
}


async function subscribeToFullRuleSet() {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  const sub = await js.subscribe('DATA.FullRuleSet', config('FullRuleSet'));

  (async (sub) => {
    for await (const m of sub) {
      index.sendEventsToAll(sc.decode(m.data));
    };
  })(sub);

  subscriptionLog('FullRuleSet')(sub);
}

async function initSubscribe() {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  
  subscribeToFullRuleSet();
}

async function publish(stream, msg) {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  const pubMsg = await js.publish(stream, sc.encode(msg));
  const capStream = pubMsg.stream;
  const msgSeq = pubMsg.seq;

  console.log(`Msg was captured by stream "${capStream}" and is seq num: ${msgSeq}`)

  await nc.drain();
}

exports.initSubscribe = initSubscribe;
exports.publish = publish;
//exports.getSingleMessage = getSingleMessage;