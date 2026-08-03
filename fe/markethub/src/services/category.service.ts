import { useMutation, UseMutationOptions, useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "@/config/axios";
import { CATEGORY_ENDPOINTS, QUERY_KEYS } from "@/contants/endPoints";

export interface Category {
    id: number;
    parentId: number | null;
    displayName: string;
    imageUrl: string | null;
    isActive: boolean;
    createdBy: number;
    updatedBy: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryMutationResponse {
    success: boolean;
    data: { id: number };
}

export interface CreateCategoryPayload {
    displayName: string;
    parentId?: number | null;
    imageUrl?: string;
    isActive?: boolean;
}

export interface UpdateCategoryPayload {
    id: number;
    displayName?: string;
    isActive?: boolean;
}

const normalizeCategory = (row: Record<string, unknown>): Category => ({
    ...(row as unknown as Category),
    isActive: Boolean(row.isActive),
    parentId: row.parentId == null ? null : Number(row.parentId),
});

const listCategoriesApi = async (): Promise<Category[]> => {
    const res = await axiosInstance.get(CATEGORY_ENDPOINTS.LIST);
    const rows = res.data?.data ?? [];
    return Array.isArray(rows) ? rows.map(normalizeCategory) : [];
};

const listCategoryChildrenApi = async (id: number | string): Promise<Category[]> => {
    const res = await axiosInstance.get(CATEGORY_ENDPOINTS.CHILDREN(id));
    const rows = res.data?.data ?? [];
    return Array.isArray(rows) ? rows.map(normalizeCategory) : [];
};

const createCategoryApi = async ({
    displayName,
    parentId,
    imageUrl,
    isActive,
}: CreateCategoryPayload): Promise<CategoryMutationResponse> => {
    const res = await axiosInstance.post(CATEGORY_ENDPOINTS.CREATE, {
        displayName,
        parentId: parentId ?? null,
        imageUrl: imageUrl || undefined,
        isActive: Boolean(isActive),
    });
    return res.data;
};

const updateCategoryApi = async ({
    id,
    displayName,
    isActive,
}: UpdateCategoryPayload): Promise<CategoryMutationResponse> => {
    const res = await axiosInstance.patch(CATEGORY_ENDPOINTS.UPDATE(id), {
        displayName,
        isActive,
    });
    return res.data;
};

export const useCategories = (options: Partial<UseQueryOptions<Category[], AxiosError>> = {}) =>
    useQuery<Category[], AxiosError>({
        queryKey: QUERY_KEYS.CATEGORIES,
        queryFn: listCategoriesApi,
        staleTime: 60 * 1000,
        ...options,
    });

export const useCategoryChildren = (
    id: number | string | undefined,
    options: Partial<UseQueryOptions<Category[], AxiosError>> = {}
) =>
    useQuery<Category[], AxiosError>({
        queryKey: QUERY_KEYS.CATEGORY_CHILDREN(id ?? ""),
        queryFn: () => listCategoryChildrenApi(id as number | string),
        enabled: id != null && id !== "",
        ...options,
    });

export const useCreateCategory = (
    options: Partial<UseMutationOptions<CategoryMutationResponse, AxiosError, CreateCategoryPayload>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCategoryApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useUpdateCategory = (
    options: Partial<UseMutationOptions<CategoryMutationResponse, AxiosError, UpdateCategoryPayload>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCategoryApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};
