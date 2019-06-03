const io = require('socket.io');
let ioServer;

function initSocket(server) {
  ioServer = io(server, { origins: '*:*'});
}

function getServer() {
  return ioServer;
}

module.exports = {
  initSocket,
  getServer,
};
