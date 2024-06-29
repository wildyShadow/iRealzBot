const self = {};
let info = {};

const hitbot = require("../node_modules/@wildyshadow/hitbot");


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
let lastWs = null;
let lastCollector = null;

self.run = async (msg,param) => {
  if (db) return;
  if (!param[0]) {
    msg.reply({
      embeds: [
        {
          title: "Invalid usage",
          description: "Param 1 required ```realz bridge <link>```\nUse any room link to start a bridge, type \"realz bridge destroy\" to destroy a bridge, bridges allow users to speak from the discord server to the hitbox room and vice versa."
        }
        ]
    })
    return;
  }
  if (param[0] == "destroy") {
    if (lastWs) {
      msg.channel.send("Destroyed a bridge")
      lastWs.close();
      lastWs = undefined;
      lastCollector.stop();
      lastCollector = undefined;
    }else{
      msg.channel.send("No bridge to destroy.");
    }
    return;
  }
  let lastMsg = false;
  if (lastWs) {
    msg.channel.send("There is already a existing bridge.");
  }
  db = true;
  const bot = new hitbot({
    name: "hitbox bridge", // Name of the bot!
    skin: 375932, // Skin color!
  });
  new Promise(async (r,f) => {
    bot.addr_from_link(param[0]).then(address => {
      msg.channel.send("Room address fetched, bot will attempt to join.")
      bot.connect(address);
      bot.on("message",async (data) => {
        if (data[0] == 7) {
          lastWs = bot.ws;
          await wait(50);
          msg.channel.send("Bridge connected!");
          bot.msg("Hello, i'm irealz, a bridge, a bot which lets players from rooms talk with users from a disocord channel and vice versa, you can talk now.")
          let collector = msg.channel.createMessageCollector({ filter: (m) => {
            if (!m.author.bot) {
              bot.msg(m.author.username+": "+m.content);
              lastMsg = m;
            }
            return false;
          }});
          lastCollector = collector;
        }
        if (data[0] == 29 && data[1] != bot.lobby.id) {
          msg.channel.send(bot.findUser(data[1]).name+": "+data[2]);
        }else if (data[0] == 5) {
          if (lastMsg) {
            lastMsg.react("❌");
          }
        }
      });
    }).catch(r => {
      msg.channel.send("An error occured, check if the link is valid.");
      f();
    })
  }).then(host => {
    
  }).catch((tyl) => {
    if (tyl == 0) {
      msg.channel.send("error occured")
    }
  })
  db = false;
}

module.exports = self;