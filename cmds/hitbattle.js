const self = {};
let info = {};

const wait = async (delay) => { 
  return new Promise((r) => {
    setTimeout(r,delay)
  });
}

const battleManager = require("./battleManager.js");

self.init = async (client,roles,Canvas) => {
  info.roles = roles
  info.client = client;
  info.canvas = Canvas;
  battleManager.init(info);
}

const {ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require("../node_modules/discord.js");


self.run = async (msg,param) => {
  let opponent = msg.mentions.users.first();
  if (opponent) {
    const battleInit_accept = new ButtonBuilder()
.setCustomId('accept')
.setLabel('Accept Match')
.setStyle(ButtonStyle.Primary);

const battleInit_decline = new ButtonBuilder()
.setCustomId('decline')
.setLabel('Decline Match')
.setStyle(ButtonStyle.Danger);

const preBattle_row = new ActionRowBuilder()
.addComponents(battleInit_accept,battleInit_decline);
    let collect = await msg.channel.send({
      embeds: [{
        title: opponent.username+", Would you like to battle with "+msg.author.username+"?"
      }]
  ,components: [preBattle_row]});
    const collector = collect.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000});
    collector.on("collect",(i) => {
      if (i.user.id == opponent.id) {
        collector.stop()
        if (i.customId == "accept") {
        battleManager.start(msg.author,opponent,msg.channel);
        }
        i.deferUpdate();
      }else{
        i.reply({content: "No, no touch >:c",ephemeral: true})
      }
    });
    collector.on("end",() => {
      battleInit_decline.setDisabled(true);
      battleInit_accept.setDisabled(true);
      collect.edit({components: [preBattle_row]});
    })
  }
}

module.exports = self;