const self = {};
let info = {};

const hitbot = require("../node_modules/@wildyshadow/hitbot");

const fs = require("fs");

let data = fs.readFileSync(__dirname+"/users.json",{ encoding: 'utf8', flag: 'r' });

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
  if (db) return;
  if (!param[0]) {
    msg.reply({
      embeds: [
        {
          title: "Invalid usage",
          description: "Param 1 required ```realz verify <link>```\nCreate a (unlisted) room, and copy the link, place it here and the bot will verify your account by joining and retrieving your data."
        }
      ]
    })
    return;
  }
  db = true;
  const bot = new hitbot({
      name: "verifier", // Name of the bot!
    skin: 375932, // Skin color!
});
new Promise(async (r,f) => {
   bot.addr_from_link(param[0]).then(address => {
 msg.channel.send("Room address fetched, bot will attempt to join.")
 bot.connect(address);
 bot.on("message",async (data) => {
   if (data[0] == 7) {
     await wait(50);
     let host = bot.findUser(0);
     if (bot.lobby.id <= 1) {
     if (host && bot.lobby.users.length <= 2) {
       bot.ws.close();
       r(host);
     }else{
       bot.ws.close();
       f(0);
     }
   }else{
     msg.channel.send("Error: This room was already verified once or someone else has joined.");
     bot.ws.close();
     f(1);
   }
   }
 });
}).catch(r => {
  msg.channel.send("An error occured, check if the link is valid.");
  f();
})
}).then(host => {
  let highestRole = -1;
  for (let i in info.roles) {
   let x = i-0;
   if (x <= host.lvl && x > highestRole) {
     highestRole = x;
   }
  }
  msg.channel.send("Got info!\nplayer: "+host.name+"\nlevel: "+host.lvl+(highestRole > -1? (`\nRole added: ${info.roles[highestRole].name}` ): ''));
  let dt = JSON.parse(data);
  dt[msg.author.id] = {
    color: host.color,
    name: host.name,
    level: host.lvl
  };
  data = JSON.stringify(dt);
  fs.writeFileSync(__dirname+"/users.json",data);
  if (highestRole > -1 && msg.guild) {
    let role = info.roles[highestRole];
    if (msg.channel.guild.members.me.roles.highest.position > role.position) {
    msg.member.roles.add(info.roles[highestRole]);
    }else{
      msg.channel.send("Cant add roles to user, are the roles under mine?");
    }
  }
}).catch((tyl) => {
  if (tyl == 0) {
  msg.channel.send("Error: Host must be the original creator of the room, There should be less than 2 players and room size must be 2.")
  }
})
  db = false;
}

module.exports = self;