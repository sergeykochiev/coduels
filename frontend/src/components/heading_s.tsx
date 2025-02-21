import { ReactNode } from "react";

export default function Heading2(props: { children: ReactNode }) {
  return (
    <h2 className="text-2xl my-2 font-semibold text-gray-300">
      {props.children}
    </h2>
  );
}
