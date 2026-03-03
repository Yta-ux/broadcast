import { TextField, type TextFieldProps } from "@mui/material";

type FormTextFieldProps = TextFieldProps & {
  label: string;
};

export const FormTextField = (props: FormTextFieldProps) => (
  <TextField
    fullWidth
    variant="outlined"
    {...props}
  />
);
