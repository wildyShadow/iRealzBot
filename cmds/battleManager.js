const self = {};

let info;

const fs = require("fs");

function integerToRGB(rgbInteger) {
  // Extract RGB components
  var red = (rgbInteger >> 16) & 0xFF;
  var green = (rgbInteger >> 8) & 0xFF;
  var blue = rgbInteger & 0xFF;
  
  return { r: red, g: green, b: blue };
}

const wait = async (delay) => { 
  return new Promise((r) => {
    setTimeout(r,delay)
  });
}

const cards = [
  
  ]
  
  const createBattle = (player1,player2) => {
    let p1 = {
      user: player1,
      hp: 100,
      deck: 0
    }
    let p2 = {
      user: player2,
      hp: 100,
      deck: 0
    }
    let dt = JSON.parse(fs.readFileSync(__dirname+"/users.json",{ encoding: 'utf8', flag: 'r' }));
    if (dt[player1.id]) {
      p1.color = dt[player1.id].color;
    }
    if (dt[player2.id]) {
      p2.color = dt[player2.id].color;
    }
    for (let i of cards1) {
      cards[i](p1);
    }
    for (let i of cards2) {
      cards[i](p2);
    } 
    p1.hp = p1.mxhp;
    p2.hp = p2.mxhp;
    let data = {
      players: [p1,p2],
      cards: [],
      state: 0,
      logs: 'game started'
    }
    return data;
  };
  
  let bg;
  
  const stepBattle = async (battleData,message) => {
    let canvas = info.canvas.createCanvas(300,1000);
    let ctx = canvas.getContext("2d");
    
  }
  
  const {ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder,StringSelectMenuOptionBuilder,AttachmentBuilder,EmbedBuilder} = require("../node_modules/discord.js");
  
  
  self.init = (inf) => info = inf;
  
  self.start = async (player1,player2,channel) => {
    
    
    const message = await channel.send({
      content: "Loading"
    })
    
    let battle = createBattle(player1,player2);
    while (!battle.isOver) {
      await stepBattle(battle,message);
      await wait(500);
    }
  }
  
  module.exports = self;