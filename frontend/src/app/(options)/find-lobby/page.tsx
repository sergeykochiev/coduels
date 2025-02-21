"use client";

import LobbyCard from "@/components/lobby-card";
import CoduelsLobby from "@/dto/lobby";
import { useEffect, useState } from "react";

export default function Page() {
  const [lobby, setLobby] = useState<Required<CoduelsLobby>[]>();
  useEffect(() => {
    async function getLobbys() {
      try {
        const res = await fetch("http://localhost:3003/lobby", {
          credentials: "include",
        });
        if (!res.ok) {
          console.log(
            "Lobby search error with status " +
              res.status +
              ": " +
              (await res.text()),
          );
        }
        const json = await res.json();
        setLobby(json);
      } catch (e) {
        console.log("Lobby search error: failed to connect to server");
      }
    }
    getLobbys();
  }, []);
  return (
    <div className="w-full p-8 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 self-start gap-4">
      {lobby && lobby.map((l) => <LobbyCard key={l.Id} data={l} />)}
    </div>
  );
}
