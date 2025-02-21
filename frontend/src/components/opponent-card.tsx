import LobbyWSInfPayload from "@/dto/info";
import CoduelsUser from "@/dto/user";
import Button from "./button";

interface IOpponentCardProps {
  data?: CoduelsUser;
  info?: LobbyWSInfPayload;
  amIHost: boolean;
  onClickInvite?: () => void;
  onClickBlock?: () => void;
}

export default function OpponentCard(props: IOpponentCardProps) {
  return (
    <section className="flex flex-col text-gray-400 items-center bg-fg min-w-[33%]">
      <p
        className={`text-xs font-medium px-3 grid place-items-center py-2 ${props.data ? "bg-green-700 text-black" : "bg-red-900 text-gray-400"} w-full`}
      >
        {!props.data ? "Nobody " : "Opponent "}connected
      </p>
      {props.data ? (
        <>
          <p className="text-gray-300 font-mono text-xl pl-4 flex justify-between items-center bg-element w-full p-3">
            {props.amIHost ? props.data.Name : "Host (" + props.data.Name + ")"}
            {props.amIHost && (
              <Button
                danger
                onClick={() => props.onClickBlock && props.onClickBlock()}
              >
                Kick
              </Button>
            )}
          </p>
          <p className="text-gray-400 p-2 px-4 self-start">Statistics</p>
          <section className="w-full flex flex-col text-gray-500 text-sm px-4 pb-4 pt-1">
            {props.info &&
              Object.entries(props.info).map((entry) => (
                <div className="flex justify-between">
                  {entry[0]}
                  <p className="place-self-end text-gray-400">{entry[1]}</p>
                </div>
              ))}
          </section>
        </>
      ) : (
        <section className="w-full p-3">
          <Button
            stretch
            onClick={() => props.onClickInvite && props.onClickInvite()}
          >
            Invite user
          </Button>
        </section>
      )}
    </section>
  );
}
