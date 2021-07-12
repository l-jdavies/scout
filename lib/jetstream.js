const { connect, StringCodec, consumerOpts, createInbox } = require('nats');
const sc = StringCodec();
const {sendEventsToAll} = require("../routes/index");

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

async function subscribeToInit() {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  const sub = await js.subscribe('FLAG.created', config('created'));
  console.log(`listening for ${sub.getSubject()}`);

  (async () => {
    for await (const m of sub) {
      console.log(`logging from subscribe to init; msg: ${sendEventsToAll}`) 
      //sendEventsToAll(m.data);
    }
  })();

  
}

async function initSubscribe() {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  subscribeToInit();
  //await js.subscribe('DATA.FullRuleSet', config('DATA.FullRuleSet'));
  //await js.subscribe('DATA.Init', config('DATA.Init'));

  subscriptionLog('DATA.FullRuleSet');
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