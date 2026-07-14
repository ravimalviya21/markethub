import { useState } from "react";
import { Button, Dropdown, Typography } from "antd";
import { EnvironmentOutlined, DownOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MOCK_LOCATIONS = [
  "Mumbai, India",
  "Delhi, India",
  "Bengaluru, India",
  "Hyderabad, India",
  "Pune, India",
];

interface LocationChangerProps {
  locations?: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (location: string) => void;
}

const LocationChanger = ({
  locations = MOCK_LOCATIONS,
  value,
  defaultValue = MOCK_LOCATIONS[0],
  onChange,
}: LocationChangerProps) => {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  const handleSelect = ({ key }: { key: string }) => {
    if (value === undefined) setInternal(key);
    onChange?.(key);
  };

  const items = locations.map((loc) => ({
    key: loc,
    label: loc,
  }));

  return (
    <Dropdown
      menu={{ items, selectable: true, selectedKeys: [current], onClick: handleSelect }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={<EnvironmentOutlined />}
        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Deliver to</Text>
          <Text strong style={{ fontSize: 13 }}>{current}</Text>
        </span>
        <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
      </Button>
    </Dropdown>
  );
};

export default LocationChanger;
