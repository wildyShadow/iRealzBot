const self = {};
let info = {}

self.init = async (client,roles,canvas,mapToCanvas) => {
  info.roles = roles
  info.client = client;
  info.canvas = canvas;
  info.mapToCanvas = mapToCanvas;
}

self.run = async (msg,param) => {
 msg.channel.send(param[0]);
}

module.exports = self;