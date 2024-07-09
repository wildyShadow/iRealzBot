const self = {};
let info = {};

const fs = require("fs");

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
  let data = fs.readFileSync(__dirname+"/maps.json",{ encoding: 'utf8', flag: 'r' });
  data = JSON.parse(data);
  let arr = [];
  for (let i in data) {
    data[i].name = i;
    arr.push(data[i]);
  }

  arr.sort((a,b) => (b.likes)-(a.likes));
  let txt = "Rank   Player  Likes/Dislikes/Maps\n";
  for (let x in arr) {
    if (x > 20) {
      break;
    }
    let y = arr[x]
    let rank = (x-0)+1;
    txt += rank+". "+y.name+": "+y.likes+"/"+y.dislikes+"/"+y.maps+"\n";
  }
  msg.channel.send({
    embeds: [
      {
        title: "Map creator Leaderboard",
        description: txt
      }
      ]
  })
}

module.exports = self;