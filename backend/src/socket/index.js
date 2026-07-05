// Placeholder for real-time delivery (future).
//
// When live notifications are needed:
//   1. npm i socket.io
//   2. In server.js:  const { initSocket } = require("./socket");
//                     initSocket(server);
//   3. Authenticate the handshake with the same access JWT
//      (utils/tokens.verifyAccessToken) and join room `user:{id}`.
//   4. In services/notification.service.js, after Notification.create,
//      emit `notification:new` to that room.
//
// Kept as a stub so the HTTP API stays dependency-light until then.

function initSocket() {
  throw new Error("socket.io is not installed yet — see src/socket/index.js");
}

module.exports = { initSocket };
