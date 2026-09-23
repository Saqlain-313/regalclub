import { io } from "socket.io-client";
import { host } from "../redux/slices/api.js";
import {
  socketConnected,
  socketDisconnected,
  socketRoundCompleted,
  socketRoundReceived,
  socketValueReceived,
} from "../redux/slices/tradingSlice.js";

let socket = null;

export function connectTradingSocket(dispatch) {
  if (socket?.connected) {
    return socket;
  }

  const url = host;

  socket = io(url, {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    dispatch(socketConnected());
  });

  socket.on("disconnect", () => {
    dispatch(socketDisconnected());
  });

  socket.on("trading:round", (round) => {
    dispatch(socketRoundReceived(round));
  });

  socket.on("trading:value", (data) => {
    dispatch(socketValueReceived(data));
  });

  socket.on("trading:completed", (data) => {
    dispatch(socketRoundCompleted(data));
  });

  return socket;
}

export function disconnectTradingSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
