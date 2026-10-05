// config/websocket.js
const WebSocket = require("ws");

let wss = null;
let heartbeatTimer = null;

const WS_PATH = "/ws";

const init = (server) => {
  if (wss) {
    console.log("⚠️ WebSocket server already initialized");
    return wss;
  }

  wss = new WebSocket.Server({
    // noServer: the HTTP server also hosts socket.io. Sharing the
    // 'upgrade' event breaks socket.io's websocket transport, so the
    // main server routes upgrades manually by path (see server.js).
    noServer: true,
    clientTracking: true,
  });

  wss.on("connection", (ws, req) => {
    console.log(`✅ WebSocket client connected | ${req.socket.remoteAddress}`);

    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (message) => {
      // Reserved for future client -> server messages.
      console.log("📩 WS message:", message.toString());
    });

    ws.on("error", (error) => {
      console.error("❌ WebSocket client error:", error.message);
    });

    ws.on("close", (code, reasonBuffer) => {
      const reason = reasonBuffer?.toString() || "none";
      console.log(`❌ Client disconnected | code=${code} | reason=${reason}`);
    });
  });

  wss.on("error", (error) => {
    console.error("❌ WebSocket server error:", error);
  });

  heartbeatTimer = setInterval(() => {
    if (!wss) return;

    wss.clients.forEach((ws) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      if (ws.isAlive === false) {
        console.log("⚠️ Terminating dead WebSocket client");
        return ws.terminate();
      }

      ws.isAlive = false;
      try {
        ws.ping();
      } catch (error) {
        console.error("❌ WebSocket ping error:", error.message);
      }
    });
  }, 30000);

  console.log(`🚀 WebSocket server initialized on ${WS_PATH}`);
  return wss;
};

const getWSS = () => wss;

const broadcast = (payload) => {
  if (!wss) return 0;

  const message = JSON.stringify(payload);
  let sent = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sent += 1;
      } catch (error) {
        console.error("❌ WebSocket send error:", error.message);
      }
    }
  });

  return sent;
};

const sendToClient = (ws, payload) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;

  try {
    ws.send(JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("❌ WebSocket client send error:", error.message);
    return false;
  }
};

const close = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  if (!wss) return;

  try {
    wss.close();
  } catch (error) {
    console.error("❌ WebSocket close error:", error.message);
  }

  wss = null;
};

const handleUpgrade = (req, socket, head) => {
  if (wss) wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
};

module.exports = {
  handleUpgrade,
  init,
  getWSS,
  broadcast,
  sendToClient,
  close,
  WS_PATH,
};
