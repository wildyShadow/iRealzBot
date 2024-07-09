const self = {};

let info;

const fs = require("fs");

const GIFencoder = require("../node_modules/gif-encoder-2");

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

function ySide(y,side) {
  if (side == 1) {
    return 250-y;
  }
  return y;
}

let bg;

function target(data,center,side,dist) {
  let target = {x:56.25,y:ySide(50,1-side)};
  dist = dist || 100;
  dist = Math.min(dist,Math.sqrt((target.x-center.x)**2+(target.y-center.y)**2));
  for (let c of data.cards) {
    if (c.side != side) {
      let d = Math.sqrt((c.x-center.x)**2+(c.y-center.y)**2);
      if (d < dist) {
        target = c;
        target.card = true;
        dist = d;
      }
    }
  }
  return {target: target,dist: dist,card: target.card};
}

const cards = [
  {
    name: "bomber",
    description: "explodes and kills (2s)",
    id: "bomb",
    deck: 1,
    gems: 10,
    hp: 20,
    draw: function(self,ctx) {
      ctx.fillStyle = self.color;
      ctx.fillRect(-4,-4,8,8);
      ctx.fillStyle = "#e5e5e5";
      ctx.fillRect(-3,-3,6,6);
      if (self.shoot == 1) {
        ctx.fillStyle = "white";
        ctx.globalAlpha = .8;
        ctx.fillRect(-20,-20,40,40);
        ctx.globalAlpha = 1;
      }
    },
    update: function(self,data) {
      let info = target(data,self,self.side,30);
      if (info.dist > 15) {
        let ang = Math.atan2(info.target.y-self.y,info.target.x-self.x);
        self.x += Math.cos(ang)*3;
        self.y += Math.sin(ang)*3;
        self.rot = ang;
      }else{
        self.shoot = (self.shoot || 0)+1
        if (self.shoot > 1) {
          if (info.card) {
            info.target.hp -= 20;
            if (info.target.hp <= 0) {
              let plr = data.players[self.side];
              if (plr) {
                plr.gems+=5;
              }
            }
          }else{ 
            let plr = data.players[1-self.side];
            if (plr) {
              plr.hp -= 20;
            }
          }
          self.hp = 0;
          self.shoot = 0;
        }
      }
    }
  },
  {
    name: "rocketeer",
    description: "shoots rockets (4s)",
    id: "rckt",
    deck: 2,
    gems: 5,
    hp: 8,
    draw: function(self,ctx) {
      ctx.fillStyle = self.color;
      ctx.fillRect(-6,-6,12,12);
      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(-5,-5,10,10);
      if (self.shoot == 3) {
        ctx.fillStyle = "white";
        ctx.globalAlpha = .8;
        ctx.fillRect(15,-2.5,200,5);
        ctx.globalAlpha = 1;
      }
    },
    update: function(self,data) {
      let info = target(data,self,self.side,70);
      if (info.dist > 50) {
        let ang = Math.atan2(info.target.y-self.y,info.target.x-self.x);
        self.x += Math.cos(ang)*2;
        self.y += Math.sin(ang)*2;
        self.rot = ang;
      }else{
        self.shoot = (self.shoot || 0)+1
        if (self.shoot > 3) {
          if (info.card) {
            info.target.hp -= 5;
            if (info.target.hp <= 0) {
              let plr = data.players[self.side];
              if (plr) {
                plr.gems+=5;
              }
            }
          }else{ 
            let plr = data.players[1-self.side];
            if (plr) {
              plr.hp -= 5;
            }
          }
          self.shoot = 0;
        }
      }
    }
  },
  {
    name: "pusher",
    description: "pushes enemies away (1s)",
    id: "puee",
    deck: .5,
    gems: 6,
    hp: 16,
    draw: function(self,ctx) {
      ctx.fillStyle = self.color;
      ctx.fillRect(-6,-6,12,12);
      ctx.fillStyle = "#00ffe1";
      ctx.fillRect(-5,-5,10,10);
      if (self.shoot == 4) {
        ctx.fillStyle = "white";
        ctx.globalAlpha = .8;
        ctx.fillRect(15,-2.5,50,5);
        ctx.globalAlpha = 1;
      }
    },
    update: function(self,data) {
      let info = target(data,self,self.side,50);
      if (info.dist > 35) {
        let ang = Math.atan2(info.target.y-self.y,info.target.x-self.x);
        self.x += Math.cos(ang)*1.4;
        self.y += Math.sin(ang)*1.4;
        self.rot = ang;
      }else{
        self.shoot = (self.shoot || 0)+1
        if (self.shoot > 4) {
          if (info.card) {
            info.target.hp -= 8;
            info.target.x += Math.cos(self.rot)*5;
            info.target.y += Math.sin(self.rot)*5;
            if (info.target.hp <= 0) {
              let plr = data.players[self.side];
              if (plr) {
                plr.gems+=16;
              }
            }
          }else{ 
            let plr = data.players[1-self.side];
            if (plr) {
              plr.hp -= 12;
            }
          }
          self.shoot = 0;
        }
      }
    }
  },
  {
    name: "batter",
    description: "meelee combat (6s)",
    id: "batts",
    deck: 3,
    gems: 8,
    draw: function(self,ctx) {
      ctx.fillStyle = self.color;
      ctx.fillRect(-6,-6,12,12);
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(-5,-5,10,10);
      if (self.shoot == 1) {
        ctx.fillStyle = "blue";
        ctx.globalAlpha = .8;
        ctx.fillRect(15,-5,80,10);
        ctx.globalAlpha = 1;
      }
    },
    update: function(self,data) {
      let info = target(data,self,self.side,40);
      if (info.dist > 5) {
        let ang = Math.atan2(info.target.y-self.y,info.target.x-self.x);
        self.x += Math.cos(ang)*1.5;
        self.y += Math.sin(ang)*1.5;
        self.rot = ang;
      }else{
        self.shoot = (self.shoot || 0)+1
        if (self.shoot > 1) {
          if (info.card) {
            info.target.hp -= 4;
            if (info.target.hp <= 0) {
              let plr = data.players[self.side];
              if (plr) {
                plr.gems+=5;
              }
            }
          }else{
            let plr = data.players[1-self.side];
            if (plr) {
              plr.hp -= 4;
            }
          }
          self.shoot = 0;
        }
      }
    }
  }
  ]
  
  let colors = [
    "white",
    "orange"
    ]
    
    const createBattle = (player1,player2) => {
      let p1 = {
        user: player1,
        hp: 100,
        gems: 20,
        side: 0,
        deck: 0
      }
      let p2 = {
        user: player2,
        hp: 100,
        gems: 20,
        side: 1,
        deck: 0
      }
      let dt = JSON.parse(fs.readFileSync(__dirname+"/users.json",{ encoding: 'utf8', flag: 'r' }));
      if (dt[player1.id]) {
        p1.color = dt[player1.id].color;
      }
      if (dt[player2.id]) {
        p2.color = dt[player2.id].color;
      }
      
      let data = {
        players: [p1,p2],
        cards: [],
        state: 0,
        logs: 'game started'
      }
      return data;
    };
    
    const drawStep = async (battleData,ctx) => {
      ctx.drawImage(bg,0,0,112.5,250);
      
      for (let p of battleData.players) {
        let rgb = integerToRGB(p.color);
        ctx.save();
        ctx.translate(56.25,ySide(25,p.side));
        ctx.fillStyle = `rgb(${rgb.r-15},${rgb.g-15},${rgb.b-15}`;
        ctx.fillRect(-6,-6,12,12);
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b}`;
        ctx.fillRect(-5,-5,10,10);
        ctx.fillStyle = "red";
        ctx.fillRect(-7,-15,15,7)
        ctx.fillStyle = "green";
        ctx.fillRect(-7,-15,(p.hp/(100))*15,7);
        ctx.restore();
      }
      
      battleData.cards = battleData.cards.filter((i) => i.hp > 0);
      
      for (let i of battleData.cards) {
        for (let c of cards) {
          if (c.id == i.type) {
            c.update(i,battleData);
            ctx.save();
            ctx.translate(i.x,i.y);
            ctx.fillStyle = "red";
            ctx.fillRect(-7,-15,15,5)
            ctx.fillStyle = "green";
            ctx.fillRect(-7,-15,(i.hp/(c.hp || 10))*15,5);
            if (i.rot) {
              ctx.rotate(i.rot);
            }
            c.draw(i,ctx);
            ctx.restore();
            break;
          }
        }
      }
    }
    
    const stepBattle = async (battleData,message) => {
      const encoder = new GIFencoder(112.5, 250,"neuquant",true,12);
      encoder.setDelay(1000/4)
      encoder.setQuality(30);
      encoder.setThreshold(10);
      encoder.start()
      let canvas = info.canvas.createCanvas(112.5,250);
      let ctx = canvas.getContext("2d");
      
      let options = [];
      
      for (let i of cards) {
        options.push(new StringSelectMenuOptionBuilder()
        .setLabel(i.name+" gems: "+i.gems)
        .setDescription(i.description)
        .setValue(i.id))
      }
      
      bg = bg || await info.canvas.loadImage("./c.png");
      for (let i = 0; i < 8; i++) {
        drawStep(battleData,ctx);
        if (i == 7) {
          encoder.setDelay(10000)
        }
        encoder.addFrame(ctx);
      }
      
      for (let p of battleData.players) {
        if (p.hp <= 0) {
          battleData.isOver = true;
        }
        p.deck-=1;
        p.gems += .35;
      }
      
      const select = new StringSelectMenuBuilder()
      .setCustomId('cards')
      .setPlaceholder('Select a card to spawn!')
      .addOptions(...options)
      
      const row = new ActionRowBuilder()
      .addComponents(select);
      encoder.finish();
      const buffer = encoder.out.getData()
      const attachment = new AttachmentBuilder(buffer, {name: "image-attachment.gif"});
      let p = battleData.players;
      const embed = new EmbedBuilder()
      .setTitle(battleData.isOver? "Game over!" : `${p[0].user.username} vs ${p[1].user.username}\n${p[1].user.username}'s gems: ${Math.floor(p[1].gems)}\n${p[0].user.username}'s gems: ${Math.floor(p[0].gems)}`)
      .setImage("attachment://image-attachment.gif");
      
      message.edit({
        embeds: [embed],
        files: [attachment],
        components: [row]
      })
      
    }
    
    const {ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder,StringSelectMenuOptionBuilder,AttachmentBuilder,EmbedBuilder} = require("../node_modules/discord.js");
    
    
    self.init = (inf) => info = inf;
    
    self.start = async (player1,player2,channel) => {
      
      
      const message = await channel.send({
        content: "Loading"
      })
      
      let battleData = createBattle(player1,player2);
      const collector = message.createMessageComponentCollector({
        filter: (i) => {
          for (let p of battleData.players) {
            if (i.user.id == p.user.id) {
              if (p.deck > 0) {
                i.reply({ephemeral: true,content: "wait "+(p.deck*2)+" seconds!"});
                return false;
              }
              for (let m of cards) {
                if (m.id == i.values[0]){
                  if (p.gems >= m.gems) {
                    p.gems -= m.gems;
                    battleData.cards.push({
                      x: Math.random()*112.5,
                      y: ySide(25,p.side),
                      type: m.id,
                      side: p.side,
                      hp: m.hp || 10,
                      color: colors[p.side]
                    })
                    p.deck = m.deck || 2;
                  }else{
                    i.reply({
                      content: "You need "+m.gems+" gems!",
                      ephemeral: true
                    })
                    return false;
                  }
                  break;
                }
              }
            }
          }
          i.deferUpdate();
          return false;
        }
      });
      
      while (!battleData.isOver) {
        await stepBattle(battleData,message);
        await wait(2000);
      }
      
      collector.stop();
    }
    
    module.exports = self;