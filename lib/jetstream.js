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

// WIP - times out before js.pull resolves
/*
async function getSingleMessage() {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  let msg = await js.pull('FullRuleSet', 'dataStream');
  console.log("get single msg");
  msg.ack()

  return sc.decode(msg.data);
}
*/

async function pullLatestRuleSet() {
  const msg = await pullSubscribeFullRuleSet(true);
  console.log(`pulled msg: ${msg}`);

  return msg;
}

async function pullSubscribeFullRuleSet(performPull = false) {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  const sub = await js.pullSubscribe('DATA.FullRuleSet', {config: {durable_name: 'dataStream'}});
  
  (async (sub) => {
    for await (const m of sub) {
      console.log(`in subscribe: ${m}`)
      m.ack();
    }
  })(sub);

  if (performPull) {
    const pulledMsg = sub.pull({batch: 10});
    console.log(`perform pull: ${pulledMsg}; sub: ${sub}`);
    await (async (sub) => {
      for await (const m of sub) {
        console.log(`msg in subscribe: ${m}`)
        m.ack();
      }
    })(sub);
    
    return pulledMsg;
  }
}

async function subscribeToFullRuleSet() {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  const sub = await js.subscribe('DATA.FullRuleSet', config('FullRuleSet'));

  (async (sub) => {
    for await (const m of sub) {
      index.sendEventsToAll(sc.decode(m.data));
      m.ack();
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
exports.pullLatestRuleSet = pullLatestRuleSet;
//exports.getSingleMessage = getSingleMessage;