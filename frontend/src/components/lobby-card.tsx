"use client";

import CoduelsLobby from "@/dto/lobby";
import Heading2 from "./heading_s";
import { useRouter } from "next/navigation";
import Button from "./button";

interface ILobbyCardProps {
  data: Required<CoduelsLobby>;
}

export default function LobbyCard(props: ILobbyCardProps) {
  const router = useRouter();
  return (
    <div className="px-4 py-2 pb-4 bg-fg flex flex-col">
      <Heading2>{props.data.Name}</Heading2>
      <section className="w-full grid grid-cols-2 mb-3 text-gray-600">
        Language
        <p className="place-self-end text-gray-500">{props.data.Lang}</p>
        Shows info?
        <p className="place-self-end text-gray-500">
          {props.data.ShowInfo ? "Yes" : "No"}
        </p>
      </section>
      <Button
        stretch={false}
        onClick={() => router.push("/lobby/" + props.data.Id)}
      >
        Open
      </Button>
    </div>
  );
}
