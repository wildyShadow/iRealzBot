const self = {};

self.init = () => {
  
}

self.run = (msg) => {
  let user = msg.mentions.users.first();
  if (user) {
    msg.channel.send({
      embeds: [
        {
          title: "Banned "+user.username,
          description: "Reason: fuc u"
        }
        ]
    });
  }
}

module.exports = self;