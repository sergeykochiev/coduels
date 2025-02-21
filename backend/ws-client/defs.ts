import { WebSocket } from "ws";

export enum WsPayloadType {
  LWS_TYPE_LBB,
  LWS_TYPE_OPP,
  LWS_TYPE_INF,
  LWS_TYPE_TRY,
  LWS_TYPE_SBT,
}

export interface WsPayload {
  msgType: WsPayloadType;
  data: string;
}

export interface LobbyTry {
  LobbyIdx: number;
  Data: string;
  Lang: string;
}

export function wsSendPayload(websocket: WebSocket, p: WsPayload) {
  websocket.send(JSON.stringify(p));
}

export function wsSendInfo(websocket: WebSocket, data: string) {
  wsSendPayload(websocket, {
    msgType: WsPayloadType.LWS_TYPE_INF,
    data: data,
  });
}

export function wsSendTry(websocket: WebSocket, data: LobbyTry) {
  wsSendPayload(websocket, {
    msgType: WsPayloadType.LWS_TYPE_TRY,
    data: JSON.stringify(data),
  });
}

export function wsSendSubmit(websocket: WebSocket, data: LobbyTry) {
  wsSendPayload(websocket, {
    msgType: WsPayloadType.LWS_TYPE_SBT,
    data: JSON.stringify(data),
  });
}
