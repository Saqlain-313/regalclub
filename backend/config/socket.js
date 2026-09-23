// const { Server } = require("socket.io");

// let io = null;

// const SOCKET_PATH = process.env.SOCKET_IO_PATH || "/ws";

// const getCorsOrigins = () => {
//   const raw = process.env.SOCKET_IO_ORIGINS;

//   if (raw) {
//     return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
//   }

//   return [
//     "http://localhost:5173",
//     "http://localhost:5174",
//     "http://localhost:5175",
//     "http://localhost:5176",
//     "http://localhost:5177",
//     "http://127.0.0.1:5173",
//     "http://127.0.0.1:5174",
//     "http://127.0.0.1:5175",
//     "http://127.0.0.1:5176",
//     "http://127.0.0.1:5177",
//     "https://control.codemax.shop",
//   ];
// };

// const init = (server) => {
//   if (io) {
//     console.log("⚠️ Socket.IO server already initialized");
//     return io;
//   }

//   if (!server || typeof server.on !== "function") {
//     throw new Error(
//       "Socket.IO init() requires the Node HTTP server created with http.createServer(app)"
//     );
//   }

//   io = new Server(server, {
//     path: SOCKET_PATH,
//     cors: {
//       origin: getCorsOrigins(),
//       credentials: true,
//       methods: ["GET", "POST"],
//     },
//     transports: ["polling", "websocket"],
//     allowUpgrades: true,
//     pingInterval: 25000,
//     pingTimeout: 20000,
//     connectTimeout: 10000,
//     serveClient: false,
//   });

//   io.engine.on("connection_error", (error) => {
//     console.error("❌ Socket.IO Engine connection error:", {
//       message: error.message,
//       code: error.code,
//       context: error.context,
//     });
//   });

//   io.engine.on("connection", (engineSocket) => {
//     console.log(
//       `🔌 Engine.IO connection | id=${engineSocket.id} | transport=${engineSocket.transport.name}`
//     );

//     engineSocket.on("upgrade", () => {
//       console.log(
//         `⬆️ Engine.IO upgraded | id=${engineSocket.id} | transport=${engineSocket.transport.name}`
//       );
//     });

//     engineSocket.on("upgradeError", (error) => {
//       console.error(
//         `❌ Engine.IO WebSocket upgrade failed | id=${engineSocket.id}:`,
//         error
//       );
//     });
//   });

//   io.on("connection", (socket) => {
//     console.log(
//       `✅ Socket.IO client connected | id=${socket.id} | transport=${socket.conn.transport.name}`
//     );

//     socket.conn.on("upgrade", () => {
//       console.log(
//         `⬆️ Socket.IO transport upgraded | id=${socket.id} | transport=${socket.conn.transport.name}`
//       );
//     });

//     socket.on("join-user", (userId) => {
//       if (userId === undefined || userId === null || String(userId).trim() === "") return;
//       const room = `user-${String(userId)}`;
//       socket.join(room);
//       console.log(`👤 ${socket.id} joined ${room}`);
//     });

//     socket.on("join-admin", (adminId) => {
//       socket.join("admin");
//       console.log(`👑 ${socket.id} joined admin${adminId ? ` | adminId=${adminId}` : ""}`);
//     });

//     socket.on("join-mines-game", (gameId) => {
//       if (gameId === undefined || gameId === null || String(gameId).trim() === "") return;
//       const room = `mines-${String(gameId)}`;
//       socket.join(room);
//       console.log(`💣 ${socket.id} joined ${room}`);
//     });

//     socket.on("leave-mines-game", (gameId) => {
//       if (gameId === undefined || gameId === null || String(gameId).trim() === "") return;
//       const room = `mines-${String(gameId)}`;
//       socket.leave(room);
//       console.log(`💣 ${socket.id} left ${room}`);
//     });

//     socket.on("pingServer", (ack) => {
//       const payload = { ok: true, timestamp: Date.now() };
//       if (typeof ack === "function") ack(payload);
//       socket.emit("pongServer", payload);
//     });

//     socket.on("disconnect", (reason) => {
//       console.log(`❌ Socket.IO client disconnected | id=${socket.id} | reason=${reason}`);
//     });

//     socket.on("error", (error) => {
//       console.error(`❌ Socket.IO client error | id=${socket.id}:`, error);
//     });
//   });

//   console.log(`🚀 Socket.IO initialized on ${SOCKET_PATH}`);
//   console.log("🚀 Socket.IO transports: polling -> websocket upgrade");

//   return io;
// };

// const getIO = () => io;

// const getClientCount = () => {
//   if (!io) return 0;
//   return io.engine?.clientsCount ?? io.sockets.sockets.size ?? 0;
// };

// const broadcast = (payload) => {
//   if (!io || !payload || typeof payload !== "object") return 0;
//   const { event, ...data } = payload;
//   if (!event) return 0;
//   io.emit(event, data);
//   return getClientCount();
// };

// const emit = (event, data = {}) => {
//   if (!io || !event) return 0;
//   io.emit(event, data);
//   return getClientCount();
// };

// const emitToSocket = (socketId, event, data = {}) => {
//   if (!io || !socketId || !event) return false;
//   const targetSocket = io.sockets.sockets.get(socketId);
//   if (!targetSocket) return false;
//   targetSocket.emit(event, data);
//   return true;
// };

// const emitToUser = (userId, event, data = {}) => {
//   if (!io || userId === undefined || userId === null || !event) return false;
//   io.to(`user-${String(userId)}`).emit(event, data);
//   return true;
// };

// const emitToAdmin = (event, data = {}) => {
//   if (!io || !event) return false;
//   io.to("admin").emit(event, data);
//   return true;
// };

// const emitToRoom = (room, event, data = {}) => {
//   if (!io || !room || !event) return false;
//   io.to(room).emit(event, data);
//   return true;
// };

// const close = async () => {
//   if (!io) return;
//   const current = io;
//   io = null;
//   try {
//     await current.close();
//     console.log("🔴 Socket.IO closed");
//   } catch (error) {
//     console.error("❌ Socket.IO close error:", error.message);
//   }
// };

// module.exports = {
//   init,
//   getIO,
//   broadcast,
//   emit,
//   emitToSocket,
//   emitToUser,
//   emitToAdmin,
//   emitToRoom,
//   close,
//   SOCKET_PATH,
// };