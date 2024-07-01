let Canvas; //= require("./node_modules/@napi-rs/canvas");
console.log('hi')

require('dotenv').config()

const token = process.env.TOKEN;
let guild = "1120491494541897728";

const commands = [
  {
    prefix: "love",
    parameters: [{
      type: "string",
      name: "name",
      optional: false
    }],
    file: "./cmds/love.js"
  },
  {
    prefix: "verify",
    perm: 0,
    file: './cmds/verify.js',
    parameters: [{
      type: "string",
      name: "link",
      optional: false
    }]
  },
  {
    prefix: "levelrequirement",
    perm: 0,
    file: "./cmds/Rounds.js",
    parameters: [
      {
        type: "number",
        name: "level"
      }
      ]
  },
    {
    prefix: "debug",
    perm: 4,
    file: './cmds/debugVerify.js',
    parameters: [{
      type: "string",
      name: "level",
      optional: false
    }]
  },
      {
    prefix: "iscreator",
    perm: 0,
    file: './cmds/mapmaker.js',
    parameters: [{
      type: "string",
      name: "playerName",
      optional: false
    }]
  },
      {
    prefix: "news",
    perm: 0,
    file: './cmds/news.js',
    parameters: []
  },
      {
    prefix: "bridge",
    perm: 0,
    file: './cmds/bridge.js',
    parameters: [{
      type: "string",
      name: "link",
      optional: false
    }]
  },
        {
    prefix: "creatorrank",
    perm: 0,
    file: './cmds/maps.js',
    parameters: []
  },
      {
    prefix: "roles",
    perm: 0,
    file: './cmds/roles.js',
    parameters: []
  }
  ]
  
  const wait = async (delay) => { 
    return new Promise((r) => {
      setTimeout(r,delay)
    });
  }
  
  let perms = {
    "748576224435109899":4,
    "463591048871018496":4
  }
  
  const { Client, RichPresence,GatewayIntentBits } = require('./node_modules/discord.js');
  const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    ],});
    
    const runCmds = {};
    
    function runCmd(path,msg,param) {
      let module = runCmds[path] || require(path);
      if (!runCmds[path]) {
        runCmds[path] = module;
        module.init(client,Roles);
      }
      module.run(msg,param);
    }
    const Roles = {};
    client.on('ready', async () => {
      console.log(`${client.user.username} is ready!`);
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
    
    client.login(token);