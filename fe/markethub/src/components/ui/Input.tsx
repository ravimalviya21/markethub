import { InputProps as AntInputProps, Input as AntInput } from "antd";
import { Controller, RegisterOptions } from "react-hook-form";

interface InputProps extends Omit<AntInputProps, "name" | "type"> {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  required?: boolean;
  rules?: RegisterOptions;
}

/**
 * Reusable Input bound to react-hook-form.
 * Self-contained vertical layout (label on top, input, error below).
 *
 * Props:
 * - name (string, required): RHF field name
 * - control (object, required): RHF control from useForm()
 * - label (string)
 * - placeholder (string)
 * - type ("text" | "email" | "password")
 * - required (boolean): shows red asterisk next to label
 * - rest: forwarded to antd Input
 */
const Input = ({
  name,
  control,
  label,
  placeholder,
  type = "text",
  required = false,
  rules,
  ...rest
}: InputProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const AntComponent =
          type === "password" ? AntInput.Password : AntInput;

        return (
          <div style={{ marginBottom: 16 }}>
            {label && (
              <label
                htmlFor={name}
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 14,
                  color: "rgba(0,0,0,0.88)",
                }}
              >
                {required && (
                  <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>
                )}
                {label}
              </label>
            )}
            <AntComponent
              {...field}
              id={name}
              type={type === "password" ? undefined : type}
              placeholder={placeholder}
              size="large"
              status={error ? "error" : ""}
              {...rest}
            />
            {error?.message && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "#ff4d4f",
                }}
              >
                {error.message}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default Input;
