import { InputHTMLAttributes } from "react";

export interface ICheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: never;
  classname?: never;
}

export default function Checkbox(props: ICheckboxProps) {
  return (
    <label className="transition-all cursor-pointer w-[20px] aspect-square bg-fg has-[input:checked]:bg-acc-orng">
      <input type="checkbox" className="hidden absolute" {...props} />
    </label>
  );
}
