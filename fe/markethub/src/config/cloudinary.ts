export const CLOUDINARY_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL || "";
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export const isCloudinaryConfigured = Boolean(CLOUDINARY_UPLOAD_URL && CLOUDINARY_UPLOAD_PRESET);

export const CLOUDINARY_FOLDERS = {
    CATEGORIES: "markethub/categories",
    BANNERS: "markethub/banners",
    PRODUCTS: "markethub/products",
    AVATARS: "markethub/avatars",
};

export const isCloudinaryUrl = (url: string | null | undefined) =>
    Boolean(url && /^https?:\/\/res\.cloudinary\.com\/.+\/upload\//.test(url));

export const withCloudinaryTransform = (
    url: string | null | undefined,
    transform = "f_auto,q_auto"
): string => {
    if (!url) return "";
    if (!isCloudinaryUrl(url)) return url;
    return url.replace("/upload/", `/upload/${transform}/`);
};
