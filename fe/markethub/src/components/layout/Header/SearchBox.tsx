import { useMemo, useState } from "react";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const MOCK_SUGGESTIONS = [
  "Wireless headphones",
  "Running shoes",
  "Smart watch",
  "Office chair",
];

const buildOptions = (query: string, suggestions: string[]) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return suggestions
    .filter((s) => s.toLowerCase().includes(q))
    .slice(0, 6)
    .map((s) => ({ value: s, label: s }));
};

interface SearchBoxProps {
  placeholder?: string;
  suggestions?: string[];
  onSearch?: (term: string) => void;
  onSelect?: (value: string) => void;
}

const SearchBox = ({
  placeholder = "Search products, brands and categories",
  suggestions = MOCK_SUGGESTIONS,
  onSearch,
  onSelect,
}: SearchBoxProps) => {
  const [value, setValue] = useState("");

  const options = useMemo(
    () => buildOptions(value, suggestions),
    [value, suggestions]
  );

  const handleSelect = (val: string) => {
    setValue(val);
    onSelect?.(val);
    onSearch?.(val);
  };

  const submit = (val?: string) => {
    const term = (val ?? value).trim();
    if (!term) return;
    onSearch?.(term);
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onChange={setValue}
      onSelect={handleSelect}
      style={{ width: "100%" }}
      popupMatchSelectWidth
    >
      <Input
        size="large"
        placeholder={placeholder}
        prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
        allowClear
        onPressEnter={(e) => submit(e.currentTarget.value)}
      />
    </AutoComplete>
  );
};

export default SearchBox;
