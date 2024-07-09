const self = {};
let info = {};

const wait = async (delay) => { 
  return new Promise((r) => {
    setTimeout(r,delay)
  });
}

function integerToRGB(rgbInteger) {
  // Extract RGB components
  var red = (rgbInteger >> 16) & 0xFF;
  var green = (rgbInteger >> 8) & 0xFF;
  var blue = rgbInteger & 0xFF;
  
  return { r: red, g: green, b: blue };
}

const fs = require("fs");

const { request } = require('../node_modules/undici');

self.init = async (client,roles,canvas,mtc,runCmd) => {
  info.roles = roles
  info.client = client;
  info.canvas = canvas;
  info.mtc = mtc;
  info.runCmd = runCmd;
}

let badges = {
  creator: {
    file: "./creator.png",
    check: (a,b) => {
      let c = JSON.parse(fs.readFileSync(__dirname+"/maps.json",{ encoding: 'utf8', flag: 'r' }));
      return c[a.name];
    }
  },
  level70: {
    file: "./70.png",
    check: (a,b) => {
      return a.level >= 70;
    }
  },
  level80: {
    file: "./80.png",
    check: (a,b) => {
      return a.level >= 80;
    }
  },
  level90: {
    file: "./90.png",
    check: (a,b) => {
      return a.level >= 90;
    }
  },
  level50: {
    file: "./50.png",
    check: (a,b) => {
      return a.level >= 50;
    }
  },
  level25: {
    file: "./25.png",
    check: (a,b) => {
      return a.level >= 25;
    }
  },
  level100: {
    file: "./100.png",
    check: (a,b) => {
      return a.level >= 100;
    }
  },
  pink: {
    file: "./pinks.png",
    check: (a,b) => a.name == "thefunniest"
  },
  top1: {
    file: "./top_1_badge.png",
    check: (a,b) => {
      let istop = true;
      for (let i in b) {
        if (b[i].level > a.level) {
          istop = false;
        }
      }
      return istop;
    }
  }
}

const {AttachmentBuilder,EmbedBuilder,ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require("../node_modules/discord.js");
let bg;
self.run = async (msg,param) => {
  let dt = JSON.parse(fs.readFileSync(__dirname+"/users.json",{ encoding: 'utf8', flag: 'r' }));
  let user = msg.mentions? (msg.mentions.users.first() || msg.author) : msg.author;
  let inform = dt[user.id];
  if (inform) {
    const canvas = info.canvas.createCanvas(600, 400);
    const context = canvas.getContext('2d');
    const avatar = await info.canvas.loadImage(user.avatarURL({ extension: 'png' }));
    bg = bg || await info.canvas.loadImage("https://static.wikia.nocookie.net/hitbox/images/6/69/Hitbox_Full_Thumbnail.png/revision/latest?cb=20240423013736");
    context.drawImage(bg,-50,-100,700,500);
    context.drawImage(avatar, 0, 0, 400, 400);
    context.font = '20px Impact'
    context.fillStyle = "white";
    context.strokeText('Level: '+inform.level, 15, 30);
    context.strokeText('Name: '+inform.name, 15, 50);
    context.fillText('Level: '+inform.level, 15, 30);
    context.fillText('Name: '+inform.name, 15, 50);
    
    context.save();
    let rgb = integerToRGB(inform.color);
    context.translate(325,325);
    context.rotate(-.3);
    context.fillStyle = `rgb(${rgb.r-15},${rgb.g-15},${rgb.b-15}`;
    context.fillRect(-82.5,-82.5,165,165);
    context.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b}`;
    context.fillRect(-75,-75,150,150);
    context.restore();
    let badge = [];
    for (let i in badges) {
      let a = badges[i];
      if (a.check(inform,dt)) {
        badge.push(await info.canvas.loadImage(a.file));
      }
    }
    for (let x in badge) {
      context.globalAlpha = 0.5;
      context.fillStyle = "black";
      context.fillRect(530-(70*x),330,70,70);
      context.globalAlpha = 1;
      context.drawImage(badge[x],530-(70*x),330,70,70);
    }
    
    const btn = new ButtonBuilder()
    .setCustomId('view')
    .setLabel('View gallery')
    .setStyle(ButtonStyle.Secondary);
    
    const row = new ActionRowBuilder()
    .addComponents(btn);
    
    const attachment = new AttachmentBuilder(canvas.toBuffer(), {name: "image-attachment.png"});
    const embed = new EmbedBuilder()
    .setTitle("Profile")
    .setImage("attachment://image-attachment.png");
    let toCollect = await msg.channel.send({embeds: [
      embed
      ], files: [attachment],components: [row]});
      const collector = toCollect.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000});
      collector.on("collect",(i) => {
        collector.stop();
        i.deferUpdate();
        info.runCmd("./cmds/gallery.js",msg,[inform.name]);
      });
      collector.on("end",() => {
        btn.setDisabled(true);
        toCollect.edit({components: [row]});
      })
  }else{
    msg.channel.send("You need to verify first.");
  }
}

module.exports = self;