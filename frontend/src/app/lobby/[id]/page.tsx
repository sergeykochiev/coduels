"use client";

import Button from "@/components/button";
import Heading2 from "@/components/heading_s";
import OpponentCard from "@/components/opponent-card";
import Textarea from "@/components/textarea";
import LobbyWSInfPayload from "@/dto/info";
import CoduelsLobby from "@/dto/lobby";
import CoduelsUser from "@/dto/user";
import { LobbyWSPayload } from "@/dto/ws-payload";
import { LobbyWSCloseCode } from "@/types/close-code";
import { LobbyWSPayloadType } from "@/types/payload-type";
import getUserFromCookie from "@/utils/get-user";
import wsSendPayload from "@/utils/send-ws-payload";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const user = getUserFromCookie();
  if (user == "") {
    router.push("/login");
  }
  const [lobby, setLobby] = useState<CoduelsLobby>();
  const [ws, setWs] = useState<WebSocket>();
  const [opponent, setOpponent] = useState<CoduelsUser>();
  const [creator, setCreator] = useState<CoduelsUser>();
  const [charNumber, setCharNumber] = useState<number>(0);
  const amIHost = creator?.Id == +user;
  const connected = ws != undefined;
  const [info, setInfo] = useState<LobbyWSInfPayload>();
  const params = useParams();
  function blockOpponent() {
    wsSendPayload(ws, LobbyWSPayloadType.LWS_TYPE_OKC, null);
  }
  function resetWsData() {
    console.log("Resetting WS data");
    setOpponent(undefined);
    setInfo(undefined);
  }
  function resetWsState() {
    console.log("Resetting WS state");
    setWs(undefined);
    resetWsData();
  }
  function wsClose() {
    console.log("Closing WS explicitly");
    if (ws && ws.readyState != ws.CLOSED && ws.readyState != ws.CLOSING) {
      ws.close();
      resetWsState();
    }
  }
  function wsOnMessage(ev: MessageEvent) {
    const data = JSON.parse(ev.data) as LobbyWSPayload;
    const eventWs = ev.target as WebSocket;
    console.log(
      "Received WS message of type",
      LobbyWSPayloadType[+data.MsgType],
    );
    switch (+data.MsgType) {
      case LobbyWSPayloadType.LWS_TYPE_LBB: {
        console.log("Received lobby info");
        setLobby(data.Data);
        break;
      }
      case LobbyWSPayloadType.LWS_TYPE_OPP: {
        console.log("Received opponent info");
        wsSendPayload<LobbyWSInfPayload>(
          eventWs,
          LobbyWSPayloadType.LWS_TYPE_INF,
          {
            CharNumber: charNumber,
          },
        );
        setOpponent(data.Data);
        break;
      }
      case LobbyWSPayloadType.LWS_TYPE_INF: {
        console.log("Received monitoring info");
        setInfo(data.Data);
        break;
      }
      case LobbyWSPayloadType.LWS_TYPE_OLV: {
        console.log("Opponent left");
        resetWsData();
        break;
      }
      case LobbyWSPayloadType.LWS_TYPE_OKC: {
        console.log("Opponent got kicked");
        resetWsData();
        break;
      }
    }
  }
  function wsOnClose(ev: CloseEvent) {
    console.log("WS closed with code", ev.code);
    resetWsState();
    switch (ev.code) {
      case LobbyWSCloseCode.LWS_CLOSE_BY_HOST: {
        console.log("Host disconnected");
        break;
      }
      case LobbyWSCloseCode.LWS_CLOSE_KICK: {
        console.log("Host kicked you :(");
        break;
      }
      case LobbyWSCloseCode.LWS_CLOSE_NOT_HOSTED: {
        console.log("Connection closed: lobby is not hosted by host");
        break;
      }
      default: {
        console.log("Disconnected from the lobby");
      }
    }
  }
  function wsConnect() {
    const ws = new WebSocket("ws://localhost:3003/lobby/" + params.id + "/ws");
    ws.onmessage = wsOnMessage;
    ws.onclose = wsOnClose;
    setWs(ws);
  }
  useEffect(() => {
    wsSendPayload<LobbyWSInfPayload>(ws, LobbyWSPayloadType.LWS_TYPE_INF, {
      CharNumber: charNumber,
    });
  }, [charNumber]);
  useEffect(() => {
    async function getLobby() {
      const res = await fetch("http://localhost:3003/lobby/" + params.id, {
        credentials: "include",
      });
      if (!res.ok) {
        console.log("Error fetching lobby");
        return;
      }
      const json = await res.json();
      setCreator(json.Creator);
      setLobby(json.Lobby);
    }
    getLobby();
  }, []);
  return (
    <div className="flex flex-col gap-8 p-8 lg:px-32 h-screen w-screen">
      <div className="flex items-center justify-between">
        <div>
          <Heading2>{lobby?.Name}</Heading2>
          <p className="place-self-end text-gray-400">
            created by {creator?.Name}
          </p>
        </div>
        <Button
          onClick={() => (!connected ? wsConnect() : wsClose())}
          danger={connected}
          accent={!connected}
        >
          {!connected ? "Connect" : "Disconnect"}
        </Button>
      </div>
      <div className="flex items-start justify-around gap-8 w-full h-full">
        <section className="w-full h-full">
          <Textarea
            disabled={!connected || opponent == undefined}
            spellCheck={false}
            className="w-full h-full font-mono"
            placeholder="Enter your code here..."
            onBlur={(e) => setCharNumber(e.target.value.length)}
          />
        </section>
        {connected && (
          <OpponentCard
            data={opponent}
            info={info!}
            amIHost={amIHost}
            onClickBlock={blockOpponent}
          />
        )}
      </div>
    </div>
  );
}
