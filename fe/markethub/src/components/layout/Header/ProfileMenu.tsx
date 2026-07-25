import { Avatar, Dropdown, MenuProps, Space, Typography } from "antd";
import { UserOutlined, DownOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface HeaderUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

type MenuItem = NonNullable<MenuProps["items"]>[number] & {
  key?: string;
  onClick?: (event?: React.MouseEvent) => void;
};

interface ProfileMenuProps {
  user?: HeaderUser;
  items?: MenuItem[];
  onSelect?: (key: string) => void;
}

const ProfileMenu = ({ user, items = [], onSelect }: ProfileMenuProps) => {
  const displayName = user?.name || user?.email || "Guest";
  const avatarSrc = user?.avatarUrl;

  const handleClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    const item = items.find((i) => i?.key === key);
    if (item?.onClick) item.onClick(domEvent as unknown as React.MouseEvent);
    onSelect?.(key);
  };

  return (
    <Dropdown
      menu={{ items, onClick: handleClick }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Space style={{ cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}>
        <Avatar
          size={32}
          src={avatarSrc}
          icon={!avatarSrc ? <UserOutlined /> : undefined}
        />
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Hello,</Text>
          <Text strong style={{ fontSize: 13 }}>{displayName}</Text>
        </span>
        <DownOutlined style={{ fontSize: 10 }} />
      </Space>
    </Dropdown>
  );
};

export default ProfileMenu;
