"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

interface ICustomLinkProps extends LinkProps {
  children: ReactNode;
}

export default function CustomLink(props: ICustomLinkProps) {
  return (
    <Link
      className="transition-all w-full px-4 pt-2 pb-1 grid place-items-center text-sm font-mono text-gray-500 hover:text-gray-400 underline"
      {...props}
    >
      {props.children}
    </Link>
  );
}
