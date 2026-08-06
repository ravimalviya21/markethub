import {
    keepPreviousData,
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
    useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "@/config/axios";
import { PRODUCT_ENDPOINTS, QUERY_KEYS } from "@/contants/endPoints";

export const PRODUCT_STATUSES = [
    "draft",
    "pending",
    "approved",
    "flagged",
    "rejected",
    "archived",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
    id: number;
    name: string;
    slug: string;
    sellerId: number;
    sellerName: string | null;
    categoryId: number | null;
    categoryName: string | null;
    description: string | null;
    price: number;
    stock: number;
    status: ProductStatus;
    averageRating: number;
    reviewsCount: number;
    primaryImageUrl: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductImage {
    id: number;
    productId: number;
    url: string;
    thumbnailUrl: string | null;
    altText: string | null;
    sortOrder: number;
}

export interface ProductDetail extends Product {
    images: ProductImage[];
}

export interface ProductListResponse {
    items: Product[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ProductListParams {
    page?: number;
    limit?: number;
    q?: string;
    status?: ProductStatus;
    categoryId?: number;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: "createdAt" | "price" | "name" | "averageRating";
    sortOrder?: "asc" | "desc";
}

export interface ProductImagePayload {
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    sortOrder?: number;
}

export interface CreateProductPayload {
    name: string;
    sellerId?: number;
    categoryId?: number | null;
    description?: string;
    price: number;
    stock?: number;
    status?: ProductStatus;
    images?: ProductImagePayload[];
}

export interface UpdateProductPayload {
    id: number;
    name?: string;
    categoryId?: number | null;
    description?: string;
    price?: number;
    stock?: number;
    images?: ProductImagePayload[];
}

export interface UpdateProductStatusPayload {
    id: number;
    status: ProductStatus;
}

export interface ProductMutationResponse {
    success: boolean;
    data: { id: number; status?: ProductStatus };
}

const normalizeProduct = <T extends Product>(product: T): T => ({
    ...product,
    price: Number(product.price),
    averageRating: Number(product.averageRating),
});

const listProductsApi = async (params: ProductListParams): Promise<ProductListResponse> => {
    const res = await axiosInstance.get(PRODUCT_ENDPOINTS.LIST, { params });
    const items = Array.isArray(res.data?.items) ? res.data.items.map(normalizeProduct) : [];
    return {
        items,
        page: Number(res.data?.page ?? 1),
        limit: Number(res.data?.limit ?? items.length),
        total: Number(res.data?.total ?? items.length),
        totalPages: Number(res.data?.totalPages ?? 0),
    };
};

const getProductApi = async (id: number | string): Promise<ProductDetail> => {
    const res = await axiosInstance.get(PRODUCT_ENDPOINTS.DETAIL(id));
    return normalizeProduct(res.data?.data);
};

const createProductApi = async (payload: CreateProductPayload): Promise<ProductMutationResponse> => {
    const res = await axiosInstance.post(PRODUCT_ENDPOINTS.CREATE, payload);
    return res.data;
};

const updateProductApi = async ({
    id,
    ...payload
}: UpdateProductPayload): Promise<ProductMutationResponse> => {
    const res = await axiosInstance.patch(PRODUCT_ENDPOINTS.UPDATE(id), payload);
    return res.data;
};

const updateProductStatusApi = async ({
    id,
    status,
}: UpdateProductStatusPayload): Promise<ProductMutationResponse> => {
    const res = await axiosInstance.patch(PRODUCT_ENDPOINTS.UPDATE_STATUS(id), { status });
    return res.data;
};

export const useProducts = (
    params: ProductListParams = {},
    options: Partial<UseQueryOptions<ProductListResponse, AxiosError>> = {}
) =>
    useQuery<ProductListResponse, AxiosError>({
        queryKey: QUERY_KEYS.PRODUCT_LIST(params),
        queryFn: () => listProductsApi(params),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
        ...options,
    });

export const useProduct = (
    id: number | string | undefined,
    options: Partial<UseQueryOptions<ProductDetail, AxiosError>> = {}
) =>
    useQuery<ProductDetail, AxiosError>({
        queryKey: QUERY_KEYS.PRODUCT_DETAIL(id ?? ""),
        queryFn: () => getProductApi(id as number | string),
        enabled: id != null && id !== "",
        ...options,
    });

export const useCreateProduct = (
    options: Partial<UseMutationOptions<ProductMutationResponse, AxiosError, CreateProductPayload>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createProductApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useUpdateProduct = (
    options: Partial<UseMutationOptions<ProductMutationResponse, AxiosError, UpdateProductPayload>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProductApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useUpdateProductStatus = (
    options: Partial<
        UseMutationOptions<ProductMutationResponse, AxiosError, UpdateProductStatusPayload>
    > = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProductStatusApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};
