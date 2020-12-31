module.exports = (client, msg, deleteWh = true) => {
  return new Promise((resolve, reject) => {
    msg.channel.getWebhooks().then(
      thing => {
        if (
          !thing.length ||
          !thing.find(t => t.type === 1)
        ) {
          msg.channel.createWebhook({ name: 'Dad Bot' }).then(
            webhook => {
              resolve(webhook);

              if (deleteWh) {
                setTimeout(() => {
                  client.deleteWebhook(webhook.id).catch(() => {});
                }, 1.8e6);
              }
            })
            .catch(reject);
        } else {
          const webhook = thing.find(wh => wh.type === 1);
          resolve(webhook);
        }
      }
    ).catch(reject);
  });
}
