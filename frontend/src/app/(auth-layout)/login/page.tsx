"use client";

import Button from "@/components/button";
import Heading2 from "@/components/heading_s";
import Input from "@/components/input";
import CustomLink from "@/components/link";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
    try {
      const basicAuthStr =
        "Basic " +
        Buffer.from(data.username + ":" + data.password).toString("base64");
      console.log(basicAuthStr);
      const res = await fetch("http://localhost:3003/login", {
        headers: {
          Authorization: basicAuthStr,
        },
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        console.log(
          "Register error with status " +
            res.status +
            ": " +
            (await res.text()),
        );
      }
    } catch (e) {
      console.log("Register error: failed to connect to server");
    }
    router.push("/");
  }
  return (
    <form className="flex flex-col gap-2 items-center" onSubmit={onSubmit}>
      <Heading2>Login</Heading2>
      <Input placeholder="Username" name="username" required />
      <Input placeholder="Password" name="password" type="password" required />
      <Button stretch accent>
        Login
      </Button>
      <CustomLink href="/register">Register</CustomLink>
    </form>
  );
}
