const self = {};
let info = {};

const wait = async (delay) => { 
    return new Promise((r) => {
      setTimeout(r,delay)
    });
  }

self.init = async (client,roles) => {
  info.roles = roles
  info.client = client;
}
let db = false;
self.run = async (msg,param) => {
  let t = 'Level roles: \n';
  for (let lvl in info.roles) {
    t += "\n<@&"+info.roles[lvl].id+"> - level "+lvl+".";
  }
  msg.channel.send({
    embeds: [
      {
        title: "List of level roles",
        description: t,
        footer: {
          text: "To verify your level and be granted a role, type realz verify | bot by ineonz"
        }
      }
      ]
  })
}

module.exports = self;