import { LobbyWSPayloadType } from "@/types/payload-type";

export interface LobbyWSPayload<data = any> {
  MsgType: LobbyWSPayloadType;
  Data: data;
}
