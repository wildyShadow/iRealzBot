const self = {};
let info = {};

const fs = require("fs");
let data = fs.readFileSync(__dirname+"/maps.json",{ encoding: 'utf8', flag: 'r' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const wait = async (delay) => { 
  return new Promise((r) => {
    setTimeout(r,delay)
  });
}

self.init = async (client,roles) => {
  info.roles = roles
  info.client = client;
}

self.run = async (msg,param) => {
  if (!param[0]) {msg.channel.send("oh no u no provide level"); return;}
  let lvl = param[0]-0;
  if (lvl != lvl) {
    msg.channel.send("Type in a valid number.");
    return;
  }
  let xp = 100*(lvl-1)**2
  msg.channel.send(`level: ${lvl}\nxp required: ${xp}\nwins required: ${Math.floor(xp/50)}\nrounds required: ${Math.floor(xp/25)}`);
}

module.exports = self;