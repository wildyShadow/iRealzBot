const self = {};
let info = {};

const wheel = require("../data/wheel.js");
const GIFencoder = require("../node_modules/gif-encoder-2");

self.init = (client,roles,Canvas) => {
  info.client = client;
  info.canvas = Canvas;
}

const {AttachmentBuilder,EmbedBuilder} = require("../node_modules/discord.js");
let difficulties = [
  "green",
  "white",
  "orange",
  "red",
  "purple",
  "pink"
  ]
self.run = async (msg) => {
  await msg.channel.send("Rolling...");
  let canvas = info.canvas.createCanvas(200,60);
  let ctx = canvas.getContext("2d");
  const encoder = new GIFencoder(200, 60)
  encoder.setDelay(1000/60)
  encoder.setQuality(25);
  encoder.setThreshold(80);
  encoder.start()
  let choosen = Math.floor(Math.random()*wheel.length);
  let y = 0;
  for (let i = 1; i <= 120; i++) {
    y += .25;
    y %= (wheel.length+.25);
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,200,60);
    ctx.font = "30px Impact";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    if (i >= 120) {
      encoder.setDelay(10000)
      y = choosen;
    }
    for (let i in wheel) {
      ctx.fillStyle = difficulties[wheel[i].difficulty];
      ctx.fillText(wheel[i].challenge,100,((i*60)+45)-(y*60))
    }
    encoder.addFrame(ctx);
  }
  
  encoder.finish();
  const buffer = encoder.out.getData()
  const attachment = new AttachmentBuilder(buffer, {name: "image-attachment.gif"});
  const embed = new EmbedBuilder()
  .setTitle("e")
  .setImage("attachment://image-attachment.gif")
  msg.channel.send({embeds: [
    embed
    ], files: [attachment] 
  });
  setTimeout(() => {
    msg.channel.send(wheel[choosen].description+"\ndifficulty: "+wheel[choosen].difficulty)
  },4000)
}

module.exports = self;