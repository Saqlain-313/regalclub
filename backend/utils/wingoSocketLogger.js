/**
 * Wingo Socket Logger
 * --------------------
 * Logs Socket.IO connection activity, timer events, result processing,
 * broadcasts and detected socket/timer lag.
 *
 * Usage:
 *   const wingoSocketLogger = require("./utils/wingoSocketLogger");
 *
 *   wingoSocketLogger.connection("connected", socket.id);
 *   wingoSocketLogger.timer("wingo", timerData);
 *   wingoSocketLogger.result("wingo", period, amount);
 *   wingoSocketLogger.broadcast("timeUpdate_11", payload);
 *   wingoSocketLogger.error("wingo", error);
 *
 * Log files:
 *   ./logs/wingo-socket-YYYY-MM-DD.log
 */

const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(process.cwd(), "logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getLogFile() {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(LOG_DIR, `wingo-socket-${date}.log`);
}

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ value: String(value) });
  }
}

function write(level, event, data = {}) {
  const now = new Date();

  const entry = {
    timestamp: now.toISOString(),
    level,
    event,
    ...data,
  };

  const line = `${safeJson(entry)}\n`;

  try {
    fs.appendFileSync(getLogFile(), line, "utf8");
  } catch (error) {
    console.error("[WINGO-SOCKET-LOGGER] Failed to write log:", error);
  }

  // Keep important socket problems visible in the server console.
  if (level === "ERROR" || level === "WARN") {
    console.log(`[WINGO-SOCKET][${level}] ${event}`, data);
  }
}

/**
 * Detect timer drift.
 *
 * expectedAt = exact expected timer boundary in milliseconds.
 * toleranceMs = allowed delay before reporting lag.
 */
function timerLag(game, expectedAt, toleranceMs = 1500) {
  const now = Date.now();
  const lagMs = Math.max(0, now - Number(expectedAt));

  if (lagMs >= toleranceMs) {
    write("WARN", "timer_lag", {
      game,
      lagMs,
      expectedAt: new Date(Number(expectedAt)).toISOString(),
      actualAt: new Date(now).toISOString(),
    });
  }

  return lagMs;
}

function connection(action, socketId, extra = {}) {
  write("INFO", `socket_${action}`, {
    socketId,
    ...extra,
  });
}

function room(action, socketId, room, extra = {}) {
  write("INFO", `room_${action}`, {
    socketId,
    room,
    ...extra,
  });
}

function timer(game, payload, extra = {}) {
  write("INFO", "timer_broadcast", {
    game,
    payload,
    ...extra,
  });
}

function broadcast(event, payload, extra = {}) {
  write("INFO", "socket_broadcast", {
    event,
    payload,
    ...extra,
  });
}

function result(game, period, amount, extra = {}) {
  write("INFO", "result_emitted", {
    game,
    period: String(period),
    amount,
    ...extra,
  });
}

function resultProcessingStart(game, period) {
  const startedAt = Date.now();

  write("INFO", "result_processing_start", {
    game,
    period: String(period),
  });

  return startedAt;
}

function resultProcessingEnd(game, period, startedAt, extra = {}) {
  const durationMs = startedAt ? Date.now() - startedAt : null;

  write("INFO", "result_processing_end", {
    game,
    period: String(period),
    durationMs,
    ...extra,
  });

  // Result processing taking more than 1.5 sec can cause visible timer lag.
  if (durationMs !== null && durationMs >= 1500) {
    write("WARN", "result_processing_slow", {
      game,
      period: String(period),
      durationMs,
    });
  }

  return durationMs;
}

function error(game, errorObject, extra = {}) {
  write("ERROR", "socket_error", {
    game,
    message: errorObject?.message || String(errorObject),
    stack: errorObject?.stack || null,
    ...extra,
  });
}

function warn(event, data = {}) {
  write("WARN", event, data);
}

function info(event, data = {}) {
  write("INFO", event, data);
}

function getLogPath() {
  return getLogFile();
}

module.exports = {
  write,
  info,
  warn,
  error,
  connection,
  room,
  timer,
  timerLag,
  broadcast,
  result,
  resultProcessingStart,
  resultProcessingEnd,
  getLogPath,
};
