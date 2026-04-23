const { Server } = require("socket.io");
const logger = require("../../utils/logger");
const { socketAuthMiddleware } = require("../../middlewares/socketAuth")
 
/**
 * Initialise Socket.io and attach it to the HTTP server.
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server} io
 */

function initSocket(httpServer) {
  
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });
 console.log(io)
  // ─── Auth middleware (runs on every connection) ───────────────────────────
  // io.use(socketAuthMiddleware);
 
  // ─── Default namespace ────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    logger.info(`[socket] connected    id=${socket.id}  user=${socket.user?.id}`);
 
    socket.on("disconnect", (reason) => {
      logger.info(`[socket] disconnected  id=${socket.id}  reason=${reason}`);
    });
  });
 
  return io;
}
 
module.exports = { initSocket };
 