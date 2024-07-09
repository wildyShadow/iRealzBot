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
  if (!param[0]) {msg.channel.send("oh no u no provide user name"); return;}
  msg.channel.send("Searching through bro's maps");
  param[0] = param[0].replace(/\+/ig,' ');
  try {
    let r = await fetch("https://hitbox.io/scripts/map_get_search_spice.php",{
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded"
      },
      body: `startingfrom=0&searchauthor=true&searchmapname=false&searchstring=${param[0]}&searchsort=best`
    });
    r = await r.json();
    let likes = 0;
    let dislikes = 0;
    let over = false;
    let highest = 0;
    for (let i = 0; i < Math.min(6,r.maps.length); i++) {
      let map = r.maps[i];
      likes += map.vu;
      dislikes += map.vd;
      if (map.vu > 150) {
        over = true;
      }
      if (map.vu > highest) {
        highest = map.vu;
      }
    }
    if (likes > 500) {
      if (r.maps.length >= 3) {
        let ratio = Number.parseFloat((likes/(likes+dislikes+50))*100).toFixed(2);
        if (ratio > 70) {
          if (over) {
          msg.channel.send(`User is a map creator.\nLikes/Dislikes: ${likes}/${dislikes} total\nMaps: ${r.maps.length} total\nLike/Dislike Ratio: ${ratio}%:${100-ratio}%\nHighest amount of likes: ${highest}`);
          let dt = JSON.parse(data);
            dt[param[0]] = {
              likes: likes,
              dislikes: dislikes,
              maps: r.maps.length
            }
            data = JSON.stringify(dt);
            fs.writeFileSync(__dirname+"/maps.json",data)
          }else{
            msg.channel.send("Requirement r not met: At least one of your maps should have atleast 150 likes.\nhighest like count: "+highest);
          }
        }else{
          msg.channel.send("Requirement 3 not met: At least 70% of like/dislike ratio is required (user has "+ratio+"%)");
        }
      }else{
        msg.channel.send("Requirement 2 not met: At least 3 maps is required. \namount of maps: "+r.maps.length)
      }
    }else{
      msg.channel.send("Requirement 1 not met: at least 500 Likes total is required.\nAmount of likes: "+likes)
    }
  } catch (err) {
    msg.channel.send("error"+err);
  }
}

module.exports = self;