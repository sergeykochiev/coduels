import Link, { LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

interface IPanelTabProps {
  href: string;
  children: ReactNode;
}

export default function PanelTab(props: IPanelTabProps) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <label
      onClick={() => router.push(props.href)}
      className="cursor-pointer whitespace-nowrap transition-all text-[16px] font-medium grid place-items-center px-8 pt-5 pb-4 font-mono text-gray-400 has-[input:checked]:bg-acc-orng has-[input:checked]:text-black hover:bg-element"
    >
      <input
        type="radio"
        className="hidden absolute"
        readOnly
        checked={pathname.startsWith(props.href)}
      />
      {props.children}
    </label>
  );
}
