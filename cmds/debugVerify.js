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
  lvl = param[0]-0;
  let highestRole = -1;
  for (let i in info.roles) {
   let x = i-0;
   if (x <= lvl && x > highestRole) {
     highestRole = x;
   }
  }
  msg.channel.send(highestRole > -1? `\nRole added: ${info.roles[highestRole].name}` : 'No role');
  if (highestRole > -1 && msg.guild) {
    msg.member.roles.add(info.roles[highestRole]);
  }
}

module.exports = self;