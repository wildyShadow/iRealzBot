const self = {};
let info = {};

const fs = require("fs");
let data = fs.readFileSync("./bundle.txt",{ encoding: 'utf8', flag: 'r' });
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
  msg.channel.send("Fetching bundle...")
  try {
    let r = await fetch("https://hitbox.io/bundle.js");
    r = await r.text();
    msg.channel.send("Bundle retrieved, attempting to compare");
    let isNew = r != data;
    if (isNew) {
      msg.channel.send("An update was found, if the latest log isnt recent, this might mean this was a silent update.");
      data = r;
      fs.writeFileSync("./bundle.txt",data);
    }
    let news = r.match(/this\..{2,2}\.push\(\[".+?(?=")"\]\);/ig);
    let sr = [];
    for (let y in news) {
      try {
      let i = news[y];
      let value = i.split(".push(")[1].split("]);")[0]+']';
      let json = JSON.parse(value);
      if (json[0].length > 4 && json.length > 2) {
      sr[y] = json;
      }
      } catch (err) {
        
      }
    }
    let newsPaper = sr[sr.length-1];
    let newsPaperTxt = '';
    for (let i = 1; i < newsPaper.length; i++) {
      newsPaperTxt+=newsPaper[i]+"\n";
    }
    msg.channel.send({
      embeds: [
        {
          title: newsPaper[0],
          description: newsPaperTxt
        }]
    })
  } catch (err) {
    msg.channel.send("Error attempting to fetch bundle. "+err);
  }
}

module.exports = self;