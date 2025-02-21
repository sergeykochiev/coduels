import { ReactNode } from "react";
import Checkbox, { ICheckboxProps } from "./checkbox";

interface ICheckboxFieldProps extends ICheckboxProps {
  children: ReactNode;
}

export default function CheckboxField({
  children,
  ...props
}: ICheckboxFieldProps) {
  return (
    <label className="cursor-pointer select-none flex justify-between items-center text-gray-500 w-full py-2">
      {children}
      <Checkbox {...props} />
    </label>
  );
}
