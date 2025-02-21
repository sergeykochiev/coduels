import { TextareaHTMLAttributes } from "react";

interface ITextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea({ className, ...props }: ITextareaProps) {
  return (
    <textarea
      className={
        "transition-all resize-none px-4 py-2 bg-fg outline-none border-none placeholder:text-gray-500 text-gray-400 " +
        className
      }
      {...props}
    />
  );
}
