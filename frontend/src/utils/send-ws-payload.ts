import { LobbyWSPayload } from "@/dto/ws-payload";
import { LobbyWSPayloadType } from "@/types/payload-type";

export default function wsSendPayload<T>(
  ws: WebSocket | undefined,
  type: LobbyWSPayloadType,
  data: T,
) {
  if (!ws) return;
  console.log("Sending WS payload of type", LobbyWSPayloadType[type]);
  ws.send(
    JSON.stringify({
      MsgType: type,
      Data: data,
    } as LobbyWSPayload<T>),
  );
}
