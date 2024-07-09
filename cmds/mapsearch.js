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
let deb = false;
self.run = async (msg,param) => {
  if (deb) {msg.channel.send("cooldown");return;}
  deb = true;
  setTimeout(() => {
    deb = false;
  },7000);
  try {
  if (!param[0]) {
    msg.channel.send("Invalid usage")
    return;
  }
  let name = '';
  for (let i = 0; i < param.length; i++) {
    name += param[i]+" ";
  }
  let parameters = name.split("&");
  if (parameters[0] && parameters[1]) {
  name = parameters[0];
  parameters = parameters[1].split(" ");
  }else{
    parameters = [undefined,undefined,undefined];
  }
  let r = await fetch("https://hitbox.io/scripts/map_get_search_spice.php",{
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    },
    body: `startingfrom=0&searchauthor=false&searchmapname=true&searchstring=${name}&searchsort=best`
  });
  r = await r.json();
  let map = r.maps[0];
  if (!map) {msg.channel.send("Couldn't find map."); return;}
  let string = map.leveldata;
  let canvas = info.mapToCanvas(string,parameters[0],parameters[1],parameters[2]);
  const attachment = new AttachmentBuilder(canvas.toBuffer(), {name: "image-attachment.png"});
  const embed = new EmbedBuilder()
  .setTitle(map.name+" by "+map.authorname)
  .setImage("attachment://image-attachment.png")
  .setDescription(`:thumbsup: ${map.vu} :thumbsdown: ${map.vd}`);
  msg.reply({embeds: [
    embed
    ], files: [attachment] });
  }catch(err){
    msg.channel.send("oh no: "+err);
  }
}

module.exports = self;