import { ReactNode } from "react";

export default function NavigationPanel(props: { children: ReactNode }) {
  return <div className="flex flex-col h-full">{props.children}</div>;
}
