import { io } from "socket.io-client";
import { host } from "../redux/slices/api";

export const socket = io(host, {
  withCredentials: true,
  autoConnect: true,
});