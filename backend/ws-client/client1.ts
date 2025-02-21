import { WebSocket } from "ws";

const ws = new WebSocket("ws://127.0.0.1:3003/lobby/0/ws", {
  origin: "http://127.0.0.1",
  headers: {
    cookie: "USERID=1",
  },
});

ws.onmessage = (ev) => {
  console.log("Websocket 2 Received message:");
  console.log(ev.data.toString());
};

ws.onclose = () => {
  console.log("WebSocket 2 closed");
  process.exit();
};
