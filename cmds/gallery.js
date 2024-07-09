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

self.init = async (client,roles,canvas,mapToCanvas) => {
  info.roles = roles
  info.client = client;
  info.canvas = canvas;
  info.mapToCanvas = mapToCanvas;
}

const pako = require("/data/data/com.termux/files/usr/lib/node_modules/pako");

function integerToRGB(rgbInteger) {
  // Extract RGB components
  var red = (rgbInteger >> 16) & 0xFF;
  var green = (rgbInteger >> 8) & 0xFF;
  var blue = rgbInteger & 0xFF;
  
  return { r: red, g: green, b: blue };
}

function decodeString(encodedString){
  let decompressed = Buffer.from(decodeURIComponent(encodedString),"base64");
  let inflated = pako.inflate(decompressed, {
    'to': "string"
  });
  let decoded = JSON.parse(inflated);
  return decoded;
}
const {AttachmentBuilder,EmbedBuilder} = require("../node_modules/discord.js");

self.run = async (msg,param) => {
  let name = '';
  for (let i = 0; i < param.length; i++) {
    if (i < param.length-1){
     name += param[i]+" ";
    }else{
      name += param[i];
    }
  }
  let r = await fetch("https://hitbox.io/scripts/map_get_search_spice.php",{
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    },
    body: `startingfrom=0&searchauthor=true&searchmapname=false&searchstring=${name}&searchsort=best`
  });
  r = await r.json();
  if (!r.maps) {
    msg.channel.send("Bot is rate limited.");
    return;
  }
 if (!r.maps[0]) {msg.channel.send("Couldn't find user."); return;}
  let canvas = info.canvas.createCanvas(350,218);
  let ctx = canvas.getContext("2d");
  let x = 0;
  let canv = [];
  for (let i in r.maps) {
    if (i >= 9) {
      break;
    }
    x += 1;
  let cv = info.mapToCanvas(r.maps[i].leveldata);
  canv.push([cv,r.maps[i].name]);
  }
  let wid = 350/3;
  let hig = 218/3;
  ctx.font = "10px Impact";
  ctx.fillStyle = "white";
  for (let i in canv) {
    let x = (i*wid)%350;
    let y = Math.floor((i*wid)/350)*hig;
    ctx.drawImage(canv[i][0],x,y,wid,hig);
    ctx.strokeText(canv[i][1],x,y+10);
    ctx.fillText(canv[i][1],x,y+10);
  }
  const attachment = new AttachmentBuilder(canvas.toBuffer(), {name: "image-attachment.png"});
  const embed = new EmbedBuilder()
  .setTitle(name)
  .setImage("attachment://image-attachment.png")
  msg.channel.send({embeds: [
    embed
    ], files: [attachment] });
}

module.exports = self;