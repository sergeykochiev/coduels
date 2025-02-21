"use client";

import CustomLink from "@/components/link";
import NavigationPanel from "@/components/nav-panel";
import PanelTab from "@/components/panel-tab";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-screen min-h-screen justify-start">
      <div className="flex flex-col bg-fg">
        <NavigationPanel>
          <PanelTab href="/create-lobby">Create lobby</PanelTab>
          <PanelTab href="/find-lobby">Find lobby</PanelTab>
        </NavigationPanel>
        <CustomLink href="/">Back</CustomLink>
      </div>
      <div className="flex items-center w-full justify-center">{children}</div>
    </div>
  );
}
