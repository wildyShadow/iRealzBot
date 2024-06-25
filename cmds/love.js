const self = {};
let info = {};

const wait = async (delay) => { 
    return new Promise((r) => {
      setTimeout(r,delay)
    });
  }

let abc = "abcdefghijklmnopqrstuvwxyz123456789-_#"

function score(name){
  let scor = 0;
  for (let i of name.split(""))
  {
    scor += abc.indexOf(i);
  }
  return scor;
}

self.init = async (client,canvas) => {
  info.canvas = canvas
  info.client = client;
}
let db = false;
self.run = async (msg,param) => {
  if (db) return;
  if (!param[0]) {
    msg.reply({
      embeds: [
        {
          title: "Invalid usage",
          description: "Param 1 required ```realz love <name>```"
        }
      ]
    })
    return;
  }
  db = true;
  msg.channel.sendTyping();
  let score1 = score(msg.author.username);
  let score2 = score(param[0]);
  let score3 = (score1+score2)%100
  let note = "not bad!"
  if (score3 > 90)
  {
    note = "yup u two date now"
  }
  if (score3 < 26) {
    note = "Not happening";
  }
   await msg.channel.send({
     embeds: [
       {
         title: `Ship between ${msg.author.username} and ${param[0]}`,
       description: `score: ${score3}%! ${note}`
       }
     ]
   })
   db = false;
}

module.exports = self;