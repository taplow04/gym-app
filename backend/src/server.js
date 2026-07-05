const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");
const { startReminderJob } = require("./jobs/reminderJob");

let server;

async function main() {
  await connectDB();
  server = app.listen(env.port, () => {
    console.log(`✓ Forge API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
  startReminderJob();
}

main().catch((err) => {
  console.error("✗ Failed to start server:", err.message);
  process.exit(1);
});

// Crash on truly unknown states — a process manager restarts us clean.
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled rejection:", err);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

// Graceful shutdown
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`\n${signal} received — shutting down gracefully`);
    if (server) server.close(() => process.exit(0));
    else process.exit(0);
  });
}
