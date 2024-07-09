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

self.init = async (client,roles,canvas) => {
  info.roles = roles
  info.client = client;
  info.canvas = canvas;
}

const {AttachmentBuilder,EmbedBuilder} = require("../node_modules/discord.js");
let bg;
self.run = async (msg,param) => {
  
  let data = fs.readFileSync(__dirname+"/users.json",{ encoding: 'utf8', flag: 'r' });
  data = JSON.parse(data);
  let arr = [];
  for (let i in data) {
    data[i].id = i;
    arr.push(data[i]);
  }
  arr.sort((a,b) => (b.level)-(a.level));
 let canvas = info.canvas.createCanvas(300,500);
 let ctx = canvas.getContext("2d");
 bg = bg || await info.canvas.loadImage("https://static.wikia.nocookie.net/hitbox/images/6/69/Hitbox_Full_Thumbnail.png/revision/latest?cb=20240423013736");
  ctx.drawImage(bg,-150,-100,620,600)
  ctx.strokeWidth = 5;
  for (let x in arr) {
    if (x > 10) {
      break;
    }
    let y = arr[x];
    ctx.fillStyle = (x-0)%2 == 0? 'orange' : 'white';
    ctx.globalAlpha = 0.2;
    ctx.fillRect(0,x*50,300,50);
    ctx.globalAlpha = 1;
    let rgb = integerToRGB(y.color);
    ctx.save();
    ctx.translate(25,25+(x*50));
    ctx.rotate(.4);
    ctx.fillStyle = `rgb(${rgb.r-20},${rgb.g-20},${rgb.b-20})`;
    ctx.strokeRect(-25,-25,50,50);
    ctx.fillRect(-25,-25,50,50);
    ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    ctx.fillRect(-20,-20,40,40);
    ctx.restore();
    ctx.fillStyle = "white";
    ctx.font = "20px Impact";
    ctx.strokeText(y.name,25,25+(x*50));
    ctx.strokeText("Level "+y.level,25,45+(x*50));
    ctx.fillText(y.name,25,25+(x*50));
    ctx.fillText("Level "+y.level,25,45+(x*50));
    ctx.font = "15px Impact";
    let rank = (x-0)+1;
    ctx.strokeText("Top "+rank,250,15+(x*50));
    ctx.fillText("Top "+rank,250,15+(x*50));
  }
	const attachment = new AttachmentBuilder(canvas.toBuffer(), {name: "image-attachment.png"});
	const embed = new EmbedBuilder()
	.setTitle("Level Ranking")
	.setImage("attachment://image-attachment.png");
	msg.reply({embeds: [
	  embed
	  ], files: [attachment] });
	console.log("sent");
}

module.exports = self;