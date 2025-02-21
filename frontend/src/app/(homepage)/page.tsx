"use client";

import Button from "@/components/button";
import Heading2 from "@/components/heading_s";
import getUserFromCookie from "@/utils/get-user";
import { redirect, useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const user = getUserFromCookie();
  if (user == "") {
    // return redirect("/login");
    router.push("/login");
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <Heading2>Home</Heading2>
      <Button stretch onClick={() => router.push("/create-lobby")} accent>
        Create lobby
      </Button>
      <Button stretch onClick={() => router.push("/find-lobby")}>
        Find lobby
      </Button>
      <Button stretch danger>
        Logout
      </Button>
    </div>
  );
}
