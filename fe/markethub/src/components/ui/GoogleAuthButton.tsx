import { Button as AntButton, Divider } from "antd";
import { GoogleOutlined } from "@ant-design/icons";

interface GoogleAuthButtonProps {
  label?: string;
  onClick?: () => void;
  loading?: boolean;
}

/**
 * "Continue with Google" button. Wire onClick to your OAuth flow.
 */
const GoogleAuthButton = ({ label = "Continue with Google", onClick, loading }: GoogleAuthButtonProps) => {
  return (
    <>
      <Divider plain style={{ marginTop: 8, marginBottom: 16 }}>
        or
      </Divider>
      <AntButton
        block
        size="large"
        icon={<GoogleOutlined />}
        onClick={onClick}
        loading={loading}
      >
        {label}
      </AntButton>
    </>
  );
};

export default GoogleAuthButton;
