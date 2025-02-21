"use client";

import Button from "@/components/button";
import Heading2 from "@/components/heading_s";
import Input from "@/components/input";
import CustomLink from "@/components/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
    if (data.password != data.passwordRepeat) {
      console.log("Password don't match");
      return;
    }
    try {
      const res = await fetch("http://localhost:3003/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.username,
          password: data.password,
        }),
      });
      if (!res.ok) {
        console.log(
          "Register error with status" + res.status + ":" + (await res.text()),
        );
      }
      router.push("/login");
      return;
    } catch (e) {
      console.log("Register error: failed to connect to server");
    }
  }
  return (
    <form className="flex flex-col gap-2 items-center" onSubmit={onSubmit}>
      <Heading2>Register</Heading2>
      <Input placeholder="Username" name="username" required />
      <Input placeholder="Password" name="password" type="password" required />
      <Input
        placeholder="Repeat password"
        name="passwordRepeat"
        type="password"
        required
      />
      <Button stretch accent>
        Register
      </Button>
      <CustomLink href="/login">Login</CustomLink>
    </form>
  );
}
