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

const {ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType,AttachmentBuilder,EmbedBuilder} = require("../node_modules/discord.js");

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

let deb = false;
self.run = async (msg,param) => {
  if (!param[0]) {
    msg.channel.send("Invalid usage")
    return;
  }
  let name = '';
  for (let i = 0; i < param.length; i++) {
    name += param[i]+" ";
  }
  
  if (deb) {msg.channel.send("cooldown");return;}
  deb = true;
  setTimeout(() => {
    deb = false;
  },7000);
  try {
    // https://hitbox.io/scripts/hotmaps/hotcache_4_0.json https://hitbox.io/scripts/playercount.json
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
    let canvas = info.mapToCanvas(string);
    let attachment = new AttachmentBuilder(canvas.toBuffer(), {name: "image-attachment.png"});
    let embed = new EmbedBuilder()
    .setTitle(map.name+" by "+map.authorname)
    .setImage("attachment://image-attachment.png")
    .setDescription(`:thumbsup: ${map.vu} :thumbsdown: ${map.vd}`);
    let mapIndex = 0;
    const previous = new ButtonBuilder()
    .setCustomId('previous')
    .setLabel('Previous')
    .setStyle(ButtonStyle.Primary);
    
    const nextm = new ButtonBuilder()
    .setCustomId('nextmb')
    .setLabel('Next')
    .setStyle(ButtonStyle.Primary);
    let ldeb = false;
    const row = new ActionRowBuilder()
    .addComponents(previous,nextm)
    let m = await msg.channel.send({embeds: [
      embed
      ], files: [attachment],
      components: [row]});
      const collector = m.createMessageComponentCollector({time: 120000,filter: (i) => {
        if (ldeb) {
          i.reply({content: "Switching maps too fast!",ephemeral: true});
          return false;
        }
        ldeb = true;
        setTimeout(() => {
          ldeb = false;
        },1500)
        i.deferUpdate();
        if (i.customId == "previous") {
          mapIndex--;
        }else{
          mapIndex++;
        }
        mapIndex = Math.min(r.maps.length-1,Math.max(0,mapIndex));
        map = r.maps[mapIndex];
        if (map) {
          let canvas = info.mapToCanvas(map.leveldata);
          attachment = new AttachmentBuilder(canvas.toBuffer(), {name: "image-attachment.png"});
          embed = new EmbedBuilder()
          .setTitle(map.name+" by "+map.authorname)
          .setImage("attachment://image-attachment.png")
          .setDescription(`:thumbsup: ${map.vu} :thumbsdown: ${map.vd}`);
          let mapIndex = 0;
          m.edit({embeds: [
            embed
            ], files: [attachment],
            components: [row]});
        }
        return false;
      }});
  collector.on("end",() => {
    previous.setDisabled(true);
    nextm.setDisabled(true);
    m.edit({components: [row]});
  });
  }catch(err){
    msg.channel.send("oh no: "+err);
  }
}

module.exports = self;