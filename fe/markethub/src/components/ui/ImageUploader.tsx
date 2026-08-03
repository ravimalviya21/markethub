import { ReactNode, useState } from "react";
import { Image, Progress, Space, Typography, Upload } from "antd";
import {
  DeleteOutlined,
  LoadingOutlined,
  PictureOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import Button from "./Button";
import { withCloudinaryTransform } from "@/config/cloudinary";
import { uploadImage } from "@/services/upload.service";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
  OptimizeImageOptions,
  formatFileSize,
  validateImageFile,
} from "@/utils/image";

const { Text } = Typography;

export interface ImageUploaderProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: ReactNode;
  folder?: string;
  optimize?: OptimizeImageOptions | false;
  maxSizeMb?: number;
  acceptedTypes?: string[];
  previewHeight?: number;
  placeholderIcon?: ReactNode;
  emptyText?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

const ImageUploader = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  folder,
  optimize,
  maxSizeMb = MAX_IMAGE_SIZE_MB,
  acceptedTypes = ACCEPTED_IMAGE_TYPES,
  previewHeight = 160,
  placeholderIcon = <PictureOutlined />,
  emptyText = "No image",
  onUploadingChange,
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sizeNote, setSizeNote] = useState<string | null>(null);

  const shownError = uploadError || error;

  const handleFile = async (file: File) => {
    const validationError = validateImageFile(file, maxSizeMb, acceptedTypes);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    setSizeNote(null);
    setProgress(0);
    setUploading(true);
    onUploadingChange?.(true);

    try {
      const uploaded = await uploadImage({
        file,
        folder,
        optimize,
        onProgress: setProgress,
      });
      onChange?.(uploaded.url);
      setSizeNote(
        uploaded.bytes < uploaded.originalBytes
          ? `Optimised ${formatFileSize(uploaded.originalBytes)} → ${formatFileSize(uploaded.bytes)}`
          : formatFileSize(uploaded.bytes)
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const handleRemove = () => {
    onChange?.(null);
    setSizeNote(null);
    setUploadError(null);
  };

  const uploadProps = {
    accept: acceptedTypes.join(","),
    multiple: false,
    showUploadList: false,
    disabled: disabled || uploading,
    beforeUpload: (file: File) => {
      handleFile(file);
      return false;
    },
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 14,
            color: "rgba(0,0,0,0.88)",
          }}
        >
          {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
          {label}
        </label>
      )}

      {!value && disabled ? (
        <div
          style={{
            border: "1px dashed #d9d9d9",
            borderRadius: 8,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            background: "#fafafa",
            color: "#bfbfbf",
          }}
        >
          <span style={{ fontSize: 28 }}>{placeholderIcon}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {emptyText}
          </Text>
        </div>
      ) : value && !uploading ? (
        <div
          style={{
            border: `1px solid ${shownError ? "#ff4d4f" : "#d9d9d9"}`,
            borderRadius: 8,
            padding: 12,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Image
            src={withCloudinaryTransform(value, "w_320,h_320,c_fill,f_auto,q_auto")}
            alt="Uploaded preview"
            width={previewHeight}
            height={previewHeight}
            style={{ objectFit: "cover", borderRadius: 6, background: "#fafafa" }}
            wrapperStyle={{ flexShrink: 0 }}
          />
          <Space direction="vertical" size={8} style={{ minWidth: 0 }}>
            {sizeNote && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {sizeNote}
              </Text>
            )}
            <Space size={8} wrap>
              <Upload {...uploadProps}>
                <Button type="default" size="small" icon={<SwapOutlined />} disabled={disabled}>
                  Replace
                </Button>
              </Upload>
              <Button
                type="default"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={disabled}
                onClick={handleRemove}
              >
                Remove
              </Button>
            </Space>
          </Space>
        </div>
      ) : (
        <Upload.Dragger {...uploadProps} style={{ borderColor: shownError ? "#ff4d4f" : undefined }}>
          <p style={{ margin: 0, fontSize: 28, color: "#1677ff" }}>
            {uploading ? <LoadingOutlined /> : placeholderIcon}
          </p>
          <p style={{ margin: "8px 0 0" }}>
            {uploading ? "Uploading…" : "Click or drag an image here"}
          </p>
          <p style={{ margin: 0 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Resized and compressed before upload · max {maxSizeMb} MB
            </Text>
          </p>
          {uploading && (
            <Progress
              percent={progress}
              size="small"
              status="active"
              style={{ maxWidth: 240, margin: "12px auto 0" }}
            />
          )}
        </Upload.Dragger>
      )}

      {shownError && (
        <div style={{ marginTop: 4, fontSize: 12, color: "#ff4d4f" }}>{shownError}</div>
      )}
      {!shownError && helperText && (
        <div style={{ marginTop: 4, fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{helperText}</div>
      )}
    </div>
  );
};

export default ImageUploader;
