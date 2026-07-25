import { UserRole } from "@/utils/auth";

export type HeaderRole = UserRole | "guest";

export interface HeaderSlots {
  logo: boolean;
  searchBar: boolean;
  locationChanger: boolean;
  profileMenu: boolean;
  cart: boolean;
}

export const HEADER_SLOTS: Record<HeaderRole, HeaderSlots> = {
  guest: {
    logo: true,
    searchBar: true,
    locationChanger: true,
    profileMenu: true,
    cart: true,
  },
  buyer: {
    logo: true,
    searchBar: true,
    locationChanger: true,
    profileMenu: true,
    cart: true,
  },
  seller: {
    logo: true,
    searchBar: false,
    locationChanger: false,
    profileMenu: true,
    cart: false,
  },
  admin: {
    logo: true,
    searchBar: false,
    locationChanger: false,
    profileMenu: true,
    cart: false,
  },
};

export const DEFAULT_HEADER_ROLE: HeaderRole = "guest";

/** Role preset, with optional per-page overrides layered on top. */
export const resolveHeaderSlots = (
  role: HeaderRole = DEFAULT_HEADER_ROLE,
  overrides?: Partial<HeaderSlots>
): HeaderSlots => ({
  ...(HEADER_SLOTS[role] ?? HEADER_SLOTS[DEFAULT_HEADER_ROLE]),
  ...overrides,
});
