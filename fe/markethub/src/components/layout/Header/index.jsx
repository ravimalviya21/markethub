import { Layout } from "antd";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import LocationChanger from "./LocationChanger";
import ProfileMenu from "./ProfileMenu";

const { Header: AntHeader } = Layout;

const Header = ({
  showSearch = true,
  showLocation = true,
  logoHref = "/",
  user,
  profileMenuItems = [],
  searchSuggestions,
  locations,
  location,
  defaultLocation,
  onSearch,
  onSelectSearch,
  onChangeLocation,
  onSelectProfileItem,
}) => {
  return (
    <AntHeader
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Logo href={logoHref} />
      </div>

      {showSearch && (
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
        {showLocation && (
          <LocationChanger
            locations={locations}
            value={location}
            defaultValue={defaultLocation}
            onChange={onChangeLocation}
          />
        )}
        <ProfileMenu
          user={user}
          items={profileMenuItems}
          onSelect={onSelectProfileItem}
        />
      </div>
    </AntHeader>
  );
};

export default Header;
