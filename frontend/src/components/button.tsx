import { ButtonHTMLAttributes } from "react";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  classname?: never;
  accent?: boolean;
  danger?: boolean;
  stretch?: boolean;
}

export default function Button({
  accent,
  stretch,
  danger,
  ...props
}: IButtonProps) {
  return (
    <button
      className={`font-medium transition-all active:scale-95 text-sm opacity-100 hover:opacity-75 px-4 pb-2 pt-3 font-mono grid place-items-center ${stretch && "w-full"} ${danger && "bg-red-900"} ${accent ? "bg-acc-orng" : "bg-element text-gray-400"}`}
      {...props}
    />
  );
}
