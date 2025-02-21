"use client";

import Button from "@/components/button";
import Checkbox from "@/components/checkbox";
import CheckboxField from "@/components/checkbox-field";
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
    const data = Object.fromEntries(
      new FormData(e.target as HTMLFormElement),
    ) as Record<string, any>;
    if (data.showInfo) data.showInfo = true;
    if (data.isPublic) data.isPublic = true;
    try {
      const res = await fetch("http://localhost:3003/lobby", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        console.log(
          "Lobby creation error with status " +
            res.status +
            ": " +
            (await res.text()),
        );
      }
      const id = await res.text();
      router.push("/lobby/" + id);
    } catch (e) {
      console.log("Lobby creation error: failed to connect to server");
    }
  }
  return (
    <form className="flex flex-col gap-2 items-center" onSubmit={onSubmit}>
      <Heading2>Create lobby</Heading2>
      <Input placeholder="Name" name="name" required />
      <Input placeholder="Task URL" name="taskUrl" required />
      <Input placeholder="Language (empty = any)" name="lang" />
      <div className="flex flex-col w-full">
        <CheckboxField name="showInfo">Show information</CheckboxField>
        <CheckboxField name="isPublic">Is public</CheckboxField>
      </div>
      <Button stretch accent>
        Create
      </Button>
    </form>
  );
}
