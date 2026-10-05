// Shared WebSocket manager.
// One physical connection is used by the whole React app.
// Components only subscribe/unsubscribe, so opening/closing pages does not
// create duplicate sockets.

const getSocketUrl = () => {
  // Optional Vite override:
  // VITE_WS_URL=ws://localhost:9099/ws
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  // Same-origin — the vite dev server proxies /ws to the main backend.
  // In production the site is served behind the same host as the API.
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${window.location.host}/ws`;
};

let socket = null;
let reconnectTimer = null;
let reconnectAttempt = 0;
let shouldReconnect = true;
const listeners = new Set();

const notify = (data) => {
  listeners.forEach((listener) => {
    try {
      listener(data);
    } catch (error) {
      console.error("WebSocket listener error:", error);
    }
  });
};

const scheduleReconnect = () => {
  if (!shouldReconnect || reconnectTimer) return;

  const delay = Math.min(1000 * (2 ** reconnectAttempt), 10000);
  reconnectAttempt += 1;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
};

const connect = () => {
  if (!shouldReconnect) return;

  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const url = getSocketUrl();
  console.log(`🔌 Connecting WebSocket: ${url}`);

  try {
    socket = new WebSocket(url);
  } catch (error) {
    console.error("❌ WebSocket create error:", error);
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    reconnectAttempt = 0;
    console.log("✅ WebSocket connected");

    notify({
      event: "socketStatus",
      status: "connected",
    });
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      notify(data);
    } catch (error) {
      console.error("❌ Invalid WebSocket message:", event.data);
    }
  };

  socket.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
    notify({
      event: "socketStatus",
      status: "error",
    });
  };

  socket.onclose = (event) => {
    console.log(
      `❌ WebSocket disconnected | code=${event.code} | reason=${event.reason || "none"}`
    );

    notify({
      event: "socketStatus",
      status: "disconnected",
      code: event.code,
      reason: event.reason || "",
    });

    socket = null;
    scheduleReconnect();
  };
};

export const subscribeSocket = (listener) => {
  listeners.add(listener);
  shouldReconnect = true;
  connect();

  return () => {
    listeners.delete(listener);

    // Do not close the shared socket here. Other pages/components may still
    // be using it. It will reconnect automatically if the server drops it.
  };
};

export const sendSocket = (payload) => {
  if (socket?.readyState !== WebSocket.OPEN) {
    return false;
  }

  try {
    socket.send(JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("❌ WebSocket send error:", error);
    return false;
  }
};

export const disconnectSocket = () => {
  shouldReconnect = false;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (socket) {
    socket.close(1000, "Client shutdown");
    socket = null;
  }

  listeners.clear();
};

export const getSocketState = () => {
  if (!socket) return "CLOSED";

  switch (socket.readyState) {
    case WebSocket.CONNECTING:
      return "CONNECTING";
    case WebSocket.OPEN:
      return "OPEN";
    case WebSocket.CLOSING:
      return "CLOSING";
    case WebSocket.CLOSED:
      return "CLOSED";
    default:
      return "UNKNOWN";
  }
};
