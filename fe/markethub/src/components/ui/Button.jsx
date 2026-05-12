import { Button as AntButton } from "antd";

/**
 * Reusable Button wrapper around antd Button.
 * Defaults size to "large" and supports the same antd Button API.
 */
const Button = ({
  children,
  type = "primary",
  size = "large",
  block = false,
  loading = false,
  htmlType = "button",
  ...rest
}) => {
  return (
    <AntButton
      type={type}
      size={size}
      block={block}
      loading={loading}
      htmlType={htmlType}
      {...rest}
    >
      {children}
    </AntButton>
  );
};

export default Button;
