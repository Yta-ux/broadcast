import { TextField, type TextFieldProps } from "@mui/material";
import { type ChangeEvent } from "react";

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

type FormPhoneFieldProps = Omit<TextFieldProps, "onChange"> & {
  value: string;
  onValueChange: (raw: string) => void;
};

export const FormPhoneField = ({
  value,
  onValueChange,
  ...props
}: FormPhoneFieldProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
    onValueChange(raw);
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      label="Telefone"
      placeholder="(00) 00000-0000"
      value={formatPhone(value)}
      onChange={handleChange}
      {...props}
    />
  );
};
