import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
    CLOUDINARY_UPLOAD_PRESET,
    CLOUDINARY_UPLOAD_URL,
    isCloudinaryConfigured,
} from "@/config/cloudinary";
import { OptimizeImageOptions, optimizeImage } from "@/utils/image";

export interface UploadedImage {
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    originalBytes: number;
}

export interface UploadImageInput {
    file: File;
    folder?: string;
    optimize?: OptimizeImageOptions | false;
    onProgress?: (percent: number) => void;
}

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
}

const toUploadError = (error: unknown) => {
    const message = (error as AxiosError<{ error?: { message?: string } }>)?.response?.data?.error
        ?.message;
    return new Error(message || "Image upload failed. Please try again.");
};

export const uploadImage = async ({
    file,
    folder,
    optimize = {},
    onProgress,
}: UploadImageInput): Promise<UploadedImage> => {
    if (!isCloudinaryConfigured) {
        throw new Error(
            "Image uploads are not configured. Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
        );
    }

    const originalBytes = file.size;
    const fileToUpload = optimize === false ? file : await optimizeImage(file, optimize);

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    if (folder) formData.append("folder", folder);

    try {
        const { data } = await axios.post<CloudinaryResponse>(CLOUDINARY_UPLOAD_URL, formData, {
            onUploadProgress: (event) => {
                if (!onProgress || !event.total) return;
                onProgress(Math.round((event.loaded * 100) / event.total));
            },
        });

        return {
            url: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
            originalBytes,
        };
    } catch (error) {
        throw toUploadError(error);
    }
};

export const useUploadImage = (
    options: Partial<UseMutationOptions<UploadedImage, Error, UploadImageInput>> = {}
) =>
    useMutation({
        mutationFn: uploadImage,
        ...options,
    });
