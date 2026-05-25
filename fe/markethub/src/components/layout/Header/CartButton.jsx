import { Badge, Tooltip } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const CartButton = ({ count = 0, onClick }) => (
  <Tooltip title="Cart" placement="bottom">
    <button
      type="button"
      onClick={onClick}
      aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        border: "none",
        background: "transparent",
        borderRadius: 8,
        cursor: "pointer",
        color: "rgba(0,0,0,0.85)",
      }}
    >
      <Badge count={count} size="small" offset={[-2, 2]} overflowCount={99}>
        <ShoppingCartOutlined style={{ fontSize: 22 }} />
      </Badge>
    </button>
  </Tooltip>
);

export default CartButton;
