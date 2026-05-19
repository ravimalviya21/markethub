import Link from "next/link";
import { Typography } from "antd";

const { Title } = Typography;

const Logo = ({ href = "/" }) => {
  return (
    <Link href={href} aria-label="MarketHub home">
      <Title
        level={3}
        style={{
          margin: 0,
          color: "#1677ff",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        MarketHub
      </Title>
    </Link>
  );
};

export default Logo;
