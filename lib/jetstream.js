const { connect, StringCodec, consumerOpts, createInbox } = require('nats');
const sc = StringCodec();

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
  // config push subscription
  // https://github.com/nats-io/nats.deno/blob/main/jetstream.md#push-subscriptions
  const opts = consumerOpts();
  opts.durable(subject);
  opts.manualAck();
  opts.ackExplicit();
  opts.deliverTo(createInbox());

  return opts
}

async function initSubscribe() {
  const nc = await connect({ servers: "localhost:4222" });
  const js = nc.jetstream();

  const sub = await js.subscribe('DATA.FullRuleSet', config('DATA.FullRuleSet'));
  subscriptionLog('DATA.FullRuleSet');
}

module.exports.initSubscribe = initSubscribe;