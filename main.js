console.log('hi')

require('dotenv').config()

const token = process.env.TOKEN;

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
    perms: 0,
    file: './cmds/verify.js',
    parameters: [{
      type: "string",
      name: "link",
      optional: false
    }]
  }
  ]
  
  const wait = async (delay) => { 
    return new Promise((r) => {
      setTimeout(r,delay)
    });
  }
  
  let perms = {
    "748576224435109899":4
  }
  let Canvas;
  
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
        module.init(client);
      }
      module.run(msg,param);
    }
    
    client.on('ready', async () => {
      console.log(`${client.user.username} is ready!`);
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
          if (msg.content == "get to sleep" && msg.author.id == "748576224435109899") {
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
              if (perm => required) {
                runCmd(i.file,msg,param);
              } else {
                msg.reply({
                  embeds: [
                    {
                      title: "Insufficient permissions",
                      description: `You require level ${required} permissions, you have ${perms}`
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