import { WebSocket } from "ws";
import { wsSendInfo, wsSendSubmit, wsSendTry } from "./defs";

const ws = new WebSocket("ws://127.0.0.1:3003/lobby/0/ws", {
  origin: "http://127.0.0.1",
  headers: {
    cookie: "USERID=0",
  },
});

const lobbyTry = {
  LobbyIdx: 0,
  Data: "dupa",
  Lang: "any",
};

ws.onopen = () => {
  setInterval(() => wsSendInfo(ws, "info"), 1000);
  wsSendTry(ws, lobbyTry);
  wsSendTry(ws, lobbyTry);
  wsSendSubmit(ws, lobbyTry);
};

ws.onmessage = (ev) => {
  console.log("Websocket 1 Received message:");
  console.log(ev.data.toString());
};

ws.onclose = () => {
  console.log("WebSocket 1 closed");
  process.exit();
};
