import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import {
  App,
  Avatar,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Layout,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  Upload,
} from "antd";
import {
  CameraOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  PlusOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import Header from "@/components/layout/Header";
import { Input, Button } from "@/components/ui";
import { USER_PROFILE } from "@/utils/dummy";

const { Content } = Layout;
const { Title, Text } = Typography;

const ROLE_LABEL = {
  buyer: "Buyer",
  seller: "Seller",
  admin: "Admin",
};

const ProfileSummary = ({ user }) => (
  <Card style={{ marginBottom: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ position: "relative" }}>
        <Avatar src={user.avatar} size={96} icon={<UserOutlined />} />
        <Upload showUploadList={false} beforeUpload={() => false}>
          <button
            type="button"
            style={{
              position: "absolute",
              right: -4,
              bottom: -4,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "#1677ff",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            }}
            aria-label="Change avatar"
          >
            <CameraOutlined />
          </button>
        </Upload>
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <Title level={4} style={{ margin: 0 }}>
          {user.firstName} {user.lastName}
        </Title>
        <Space size={8} style={{ marginTop: 4 }} wrap>
          <Tag color="blue">{ROLE_LABEL[user.role] || "User"}</Tag>
          <Text type="secondary">
            Member since {dayjs(user.memberSince).format("MMM YYYY")}
          </Text>
        </Space>
        <div style={{ marginTop: 6 }}>
          <Text type="secondary">{user.email}</Text>
        </div>
      </div>
    </div>
  </Card>
);

const PersonalInfoTab = ({ user, onSave }) => {
  const { control, handleSubmit, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob ? dayjs(user.dob) : null,
    },
    mode: "onTouched",
  });

  return (
    <Card>
      <Title level={5} style={{ marginTop: 0 }}>Personal Information</Title>
      <Text type="secondary">Update your personal details and contact info.</Text>
      <form onSubmit={handleSubmit(onSave)} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Input name="firstName" control={control} label="First name" required />
          </Col>
          <Col xs={24} sm={12}>
            <Input name="lastName" control={control} label="Last name" required />
          </Col>
          <Col xs={24} sm={12}>
            <Input name="email" control={control} label="Email" type="email" required />
          </Col>
          <Col xs={24} sm={12}>
            <Input name="phone" control={control} label="Phone" />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 14,
                }}
              >
                Gender
              </label>
              <Radio.Group
                defaultValue={user.gender}
                onChange={(e) => control._formValues.gender = e.target.value}
              >
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Radio.Group>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 14,
                }}
              >
                Date of birth
              </label>
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                defaultValue={user.dob ? dayjs(user.dob) : null}
                format="DD MMM YYYY"
              />
            </div>
          </Col>
        </Row>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Button htmlType="submit" loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
          <Button type="default" htmlType="reset">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

const AddressCard = ({ address, onEdit, onDelete, onMakeDefault }) => (
  <Card
    size="small"
    style={{
      borderColor: address.isDefault ? "#1677ff" : undefined,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <Space size={8} style={{ marginBottom: 6 }}>
          <Text strong>
            {address.label === "Home" ? <HomeOutlined /> : <EnvironmentOutlined />} {address.label}
          </Text>
          {address.isDefault && <Tag color="blue">Default</Tag>}
        </Space>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          <div>{address.name} &middot; {address.phone}</div>
          <div>{address.line1}</div>
          {address.line2 && <div>{address.line2}</div>}
          <div>{address.city}, {address.state} {address.pincode}</div>
          <div>{address.country}</div>
        </div>
      </div>
    </div>
    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button size="middle" type="default" onClick={() => onEdit?.(address)}>Edit</Button>
      {!address.isDefault && (
        <Button size="middle" type="default" onClick={() => onMakeDefault?.(address)}>
          Set as default
        </Button>
      )}
      <Button size="middle" type="default" danger onClick={() => onDelete?.(address)}>
        Delete
      </Button>
    </div>
  </Card>
);

const EMPTY_ADDRESS = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

const AddressFormModal = ({ open, address, onCancel, onSubmit }) => {
  const isEdit = Boolean(address?.id);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: EMPTY_ADDRESS,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      reset(address ? { ...EMPTY_ADDRESS, ...address } : EMPTY_ADDRESS);
    }
  }, [open, address, reset]);

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit address" : "Add new address"}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      centered
      width={640}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 8 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>
                Address label
              </label>
              <Controller
                name="label"
                control={control}
                rules={{ required: "Label is required" }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Select
                      {...field}
                      size="large"
                      style={{ width: "100%" }}
                      status={error ? "error" : ""}
                      options={[
                        { value: "Home", label: "Home" },
                        { value: "Office", label: "Office" },
                        { value: "Other", label: "Other" },
                      ]}
                    />
                    {error?.message && (
                      <div style={{ marginTop: 4, fontSize: 12, color: "#ff4d4f" }}>
                        {error.message}
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="name"
              control={control}
              label="Full name"
              required
              rules={{ required: "Name is required" }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="phone"
              control={control}
              label="Phone"
              required
              rules={{ required: "Phone is required" }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="pincode"
              control={control}
              label="Pincode"
              required
              rules={{ required: "Pincode is required" }}
            />
          </Col>
          <Col xs={24}>
            <Input
              name="line1"
              control={control}
              label="Address line 1"
              required
              rules={{ required: "Address line 1 is required" }}
            />
          </Col>
          <Col xs={24}>
            <Input name="line2" control={control} label="Address line 2" />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="city"
              control={control}
              label="City"
              required
              rules={{ required: "City is required" }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="state"
              control={control}
              label="State"
              required
              rules={{ required: "State is required" }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="country"
              control={control}
              label="Country"
              required
              rules={{ required: "Country is required" }}
            />
          </Col>
          <Col xs={24}>
            <Controller
              name="isDefault"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Checkbox
                  {...rest}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                  style={{ marginBottom: 16 }}
                >
                  Set as default address
                </Checkbox>
              )}
            />
          </Col>
        </Row>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button type="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button htmlType="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Add address"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const AddressesTab = ({ addresses, onAdd, onEdit, onDelete, onMakeDefault }) => (
  <Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div>
        <Title level={5} style={{ margin: 0 }}>Saved Addresses</Title>
        <Text type="secondary">Manage your delivery addresses.</Text>
      </div>
      <Button icon={<PlusOutlined />} onClick={onAdd}>
        Add address
      </Button>
    </div>
    <Row gutter={[16, 16]}>
      {addresses.map((address) => (
        <Col key={address.id} xs={24} md={12}>
          <AddressCard
            address={address}
            onEdit={onEdit}
            onDelete={onDelete}
            onMakeDefault={onMakeDefault}
          />
        </Col>
      ))}
    </Row>
  </Card>
);

const SecurityTab = ({ onChangePassword }) => {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  return (
    <Card>
      <Title level={5} style={{ marginTop: 0 }}>Change Password</Title>
      <Text type="secondary">
        Use a strong password you don't use elsewhere.
      </Text>
      <form onSubmit={handleSubmit(onChangePassword)} style={{ marginTop: 16, maxWidth: 440 }}>
        <Input
          name="currentPassword"
          control={control}
          label="Current password"
          type="password"
          required
        />
        <Input
          name="newPassword"
          control={control}
          label="New password"
          type="password"
          required
        />
        <Input
          name="confirmPassword"
          control={control}
          label="Confirm new password"
          type="password"
          required
        />
        <Button htmlType="submit" loading={isSubmitting} icon={<LockOutlined />}>
          Update password
        </Button>
      </form>
    </Card>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState(USER_PROFILE);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => router.push("/profile"),
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "My Orders",
      onClick: () => router.push(`/${user.role}/orders`),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      danger: true,
      onClick: () => router.push("/auth/login"),
    },
  ];

  const handleSavePersonal = (values) => {
    setUser((prev) => ({ ...prev, ...values, dob: values.dob ? values.dob.format("YYYY-MM-DD") : prev.dob }));
    message.success("Profile updated");
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressModalOpen(true);
  };
  const handleEditAddress = (a) => {
    setEditingAddress(a);
    setAddressModalOpen(true);
  };
  const handleAddressSubmit = (values) => {
    setUser((prev) => {
      const isEdit = Boolean(editingAddress?.id);
      const willBeDefault = values.isDefault;
      const next = isEdit
        ? prev.addresses.map((x) =>
            x.id === editingAddress.id ? { ...x, ...values } : x
          )
        : [
            ...prev.addresses,
            { ...values, id: `addr-${Date.now()}` },
          ];
      const normalized = willBeDefault
        ? next.map((x) => ({
            ...x,
            isDefault:
              isEdit
                ? x.id === editingAddress.id
                : x.id === next[next.length - 1].id,
          }))
        : next;
      return { ...prev, addresses: normalized };
    });
    message.success(editingAddress ? "Address updated" : "Address added");
    setAddressModalOpen(false);
    setEditingAddress(null);
  };
  const handleAddressCancel = () => {
    setAddressModalOpen(false);
    setEditingAddress(null);
  };
  const handleDeleteAddress = (a) => {
    setUser((prev) => ({ ...prev, addresses: prev.addresses.filter((x) => x.id !== a.id) }));
    message.success("Address removed");
  };
  const handleMakeDefault = (a) => {
    setUser((prev) => ({
      ...prev,
      addresses: prev.addresses.map((x) => ({ ...x, isDefault: x.id === a.id })),
    }));
    message.success(`${a.label} set as default`);
  };
  const handleChangePassword = () => message.success("Password updated");

  const items = [
    {
      key: "personal",
      label: (<span><UserOutlined /> Personal info</span>),
      children: <PersonalInfoTab user={user} onSave={handleSavePersonal} />,
    },
    {
      key: "addresses",
      label: (<span><EnvironmentOutlined /> Addresses</span>),
      children: (
        <AddressesTab
          addresses={user.addresses}
          onAdd={handleAddAddress}
          onEdit={handleEditAddress}
          onDelete={handleDeleteAddress}
          onMakeDefault={handleMakeDefault}
        />
      ),
    },
    {
      key: "security",
      label: (<span><LockOutlined /> Security</span>),
      children: <SecurityTab onChangePassword={handleChangePassword} />,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        user={{ name: `${user.firstName} ${user.lastName}` }}
        profileMenuItems={profileMenuItems}
        onSearch={(term) => console.log("search:", term)}
        onChangeLocation={(loc) => console.log("location:", loc)}
      />
      <Content>
        <div style={{ padding: 24, maxWidth: 1100, width: "100%", margin: "0 auto" }}>
          <Title level={3} style={{ marginTop: 8 }}>My Profile</Title>
          <Text type="secondary">Manage your account information and preferences.</Text>

          <div style={{ marginTop: 24 }}>
            <ProfileSummary user={user} />
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={items}
              size="large"
            />
          </div>
        </div>
      </Content>
      <AddressFormModal
        open={addressModalOpen}
        address={editingAddress}
        onCancel={handleAddressCancel}
        onSubmit={handleAddressSubmit}
      />
    </Layout>
  );
}
