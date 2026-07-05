const Notification = require("../models/Notification");

// Single write-path for notifications — jobs, controllers, and services
// all create them here (and this is where a socket.io emit would go).

async function createNotification(userId, { type, title, body = "", meta = {} }) {
  return Notification.create({ user: userId, type, title, body, meta });
}

module.exports = { createNotification };
