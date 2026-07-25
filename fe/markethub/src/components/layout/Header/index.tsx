import { Layout, MenuProps } from "antd";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import LocationChanger from "./LocationChanger";
import ProfileMenu, { HeaderUser } from "./ProfileMenu";
import CartButton from "./CartButton";
import { HeaderRole, HeaderSlots, resolveHeaderSlots } from "./config";

const { Header: AntHeader } = Layout;

type MenuItem = NonNullable<MenuProps["items"]>[number] & {
  key?: string;
  onClick?: (event?: React.MouseEvent) => void;
};

interface HeaderProps {
  role?: HeaderRole;
  slots?: Partial<HeaderSlots>;
  logoHref?: string;
  user?: HeaderUser;
  profileMenuItems?: MenuItem[];
  searchSuggestions?: string[];
  locations?: string[];
  location?: string;
  defaultLocation?: string;
  cartCount?: number;
  onSearch?: (term: string) => void;
  onSelectSearch?: (value: string) => void;
  onChangeLocation?: (location: string) => void;
  onSelectProfileItem?: (key: string) => void;
  onCartClick?: () => void;
}

const Header = ({
  role,
  slots,
  logoHref = "/",
  user,
  profileMenuItems = [],
  searchSuggestions,
  locations,
  location,
  defaultLocation,
  cartCount = 0,
  onSearch,
  onSelectSearch,
  onChangeLocation,
  onSelectProfileItem,
  onCartClick,
}: HeaderProps) => {
  const visible = resolveHeaderSlots(role, slots);

  return (
    <AntHeader
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        padding: "12px 24px",
        height: "auto",
        lineHeight: "normal",
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      {visible.logo && (
        <div style={{ flexShrink: 0 }}>
          <Logo href={logoHref} />
        </div>
      )}

      {visible.searchBar && (
        <div style={{ flex: 1, maxWidth: 720 }}>
          <SearchBox
            suggestions={searchSuggestions}
            onSearch={onSearch}
            onSelect={onSelectSearch}
          />
        </div>
      )}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {visible.locationChanger && (
          <LocationChanger
            locations={locations}
            value={location}
            defaultValue={defaultLocation}
            onChange={onChangeLocation}
          />
        )}
        {visible.profileMenu && (
          <ProfileMenu
            user={user}
            items={profileMenuItems}
            onSelect={onSelectProfileItem}
          />
        )}
        {visible.cart && (
          <CartButton count={cartCount} onClick={onCartClick} />
        )}
      </div>
    </AntHeader>
  );
};

export default Header;
