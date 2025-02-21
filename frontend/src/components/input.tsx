import { InputHTMLAttributes } from "react";

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  classname?: never;
}

export default function Input(props: IInputProps) {
  return (
    <input
      className="transition-all px-4 py-2 bg-element opacity-50 focus:opacity-100 outline-none border-none placeholder:text-gray-500 text-gray-300"
      {...props}
    />
  );
}
