//let Canvas; //= require("./node_modules/@napi-rs/canvas");

const Canvas = require("/data/data/com.termux/files/usr/lib/node_modules/canvas");

const fs = require("fs");

console.log('hi')

require('dotenv').config()

const token = process.env.TOKEN;
let guild = "1120491494541897728";
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

const commands = require("./cmds.json");

const {mapToCanvas} = require("./canvasUtils.js");

const wait = async (delay) => { 
  return new Promise((r) => {
    setTimeout(r,delay)
  });
}

let perms = {
  "748576224435109899":4,
  "463591048871018496":4
}

const { Client, RichPresence,GatewayIntentBits,Partials} = require('./node_modules/discord.js');

const client = new Client({intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessageReactions
  ],partials: [Partials.User,Partials.Message]});
  
  const runCmds = {};
  let runCmd;
  runCmd = (path,msg,param) => {
    let module = runCmds[path] || require(path);
    if (!runCmds[path]) {
      runCmds[path] = module;
      module.init(client,Roles,Canvas,mapToCanvas,runCmd);
    }
    module.run(msg,param);
  }
  
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  
  let statuses = [
    async () => {
      return {
        activities: [{
          name: "Fortnite",
          type: "Playing"
        }]
      }
    },
    async () => {
      let r = await fetch("https://hitbox.io/scripts/playercount.json");
      r = await r.json();
      return {
        activities: [{
          name: "hitbox.io with "+r.counts.total+" other players",
          type: "Playing"
        }]
      }
    },
    async () => {
      return {
        activities: [{
          name: "amogus",
          type: "Playing"
        }]
      }
    },
    async () => {
      return {
        activities: [{
          name: "In korea, people have two ages instead of one.",
          type: "Playing"
        }]
      }
    }
    ]
    
    async function switchStatus() {
      try {
        let status = await statuses[Math.floor(Math.random()*statuses.length)]();
        client.user.setPresence(status);
      }catch(err){
        
      }
    }
    const Roles = {};
    client.on('ready', async () => {
      console.log(`${client.user.username} is ready!`);
      require("./register.js")(commands,guild,process.env.CLIENT,token);
      switchStatus();
      setInterval(switchStatus,30000);
      let server = await client.guilds.fetch(guild);
      let roles = await server.roles.fetch();
      roles.forEach(r => {
        if (r.name.startsWith("Level ")) {
          let lvl = r.name.split("Level ")[1]-0;
          if (lvl == lvl) {
            Roles[lvl] = r;
          }
        }
      })
    })
    
    let db = false;
    const prefix = 'realz';
    
    client.on("messageCreate", async (msg) => {
      if (!msg.author.bot) {
        if (msg.content.toLowerCase() == prefix+" help") {
          let t = '';
          for (let i of commands) {
            let params = '';
            for (let x of i.parameters) {
              params += x.optional? `[${x.name}] ` : `<${x.name}> `;
            }
            t += '\n'+prefix+' '+i.prefix+' '+params
          }
          msg.channel.send({
            embeds: [
              {
                title: "Help",
                description: `Help command \n${t}`,
                footer: {
                  text: `Prefix: ${prefix} | bot by ineonz`
                }
              }
              ]
          });
        }else{
          // Other commands
          if (msg.content == "get to sleep" && perms[msg.author.id] == 4) {
            await msg.reply("zzzz");
            process.exit();
            return; 
          }
          let ran = false;
          for (let i of commands) {
            if (msg.content.startsWith(prefix+" "+i.prefix)) {
              let param = (msg.content.split(prefix+" "+i.prefix+ ' ')[1] || '').split(" ");
              let perm = perms[msg.author.id] || 0;
              let required = i.perm || 0;
              if (perm >= required) {
                runCmd(i.file,msg,param);
              } else {
                msg.reply({
                  embeds: [
                    {
                      title: "Insufficient permissions",
                      description: `You require level ${required} permissions, you have ${perm}`
                    }
                    ]
                });
              }
              ran = true;
              break;
            }
          }
          if (!ran && msg.content.startsWith(prefix)) {
            msg.channel.send({
              embeds: [
                {
                  title: "Unknown command.",
                  description: "You attempted to run a command that does not exist. ("+msg.content.substring(0,16)+"...)"
                }
                ]
            })
          }
        }
      }
    })
    
    client.on('messageReactionAdd', async(reaction_orig, user) => {
      const message = !reaction_orig.message.author
      ? await reaction_orig.message.fetch()
      : reaction_orig.message;
      if (message.author.id === client.user.id && reaction_orig.emoji.name == "❌") {
        message.delete();
      }
    });
    
    client.on("interactionCreate", async interaction => {
      if (!interaction.isChatInputCommand()) return;
      interaction.author = interaction.user;
      interaction.author.member = interaction.member;
      interaction.mentions = {users: {
        first: () => undefined
      }};
      for (let i of commands) {
        if (i.prefix == interaction.commandName) {
          let param = [];
          for (let pn of i.parameters) {
            let parameter = interaction.options.getString(pn.name) ?? undefined;
            if (parameter) {
              param.push(parameter);
            }
          }
          let perm = perms[interaction.user.id] || 0;
          let required = i.perm || 0;
          if (perm >= required) {
            await interaction.reply({content:"running",ephemeral: true});
            await runCmd(i.file,interaction,param)
            break;
          }else{
            await interaction.reply({content:"requires permission",ephemeral: true});
          }
        }
      }
    });
    
    client.login(token);
    
    const renew = require("./renewplayers.js");
    renew();
    setInterval(() => {
      console.log("renewing players");
      renew();
    },700000);