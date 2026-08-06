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
import { QUERY_KEYS, USER_ENDPOINTS } from "@/contants/endPoints";

export type UserRole = "buyer" | "seller" | "admin";

export interface PlatformUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isEmailVerified: boolean;
    created_at?: string;
}

export interface UserListParams {
    page?: number;
    limit?: number;
    q?: string;
    role?: UserRole;
}

export interface UserListResponse {
    items: PlatformUser[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const normalizeUser = (user: PlatformUser): PlatformUser => ({
    ...user,
    isEmailVerified: Boolean(user.isEmailVerified),
});

const listUsersApi = async (params: UserListParams): Promise<UserListResponse> => {
    const res = await axiosInstance.get(USER_ENDPOINTS.LIST, { params });
    const items = Array.isArray(res.data?.items) ? res.data.items.map(normalizeUser) : [];
    return {
        items,
        page: Number(res.data?.page ?? 1),
        limit: Number(res.data?.limit ?? items.length),
        total: Number(res.data?.total ?? items.length),
        totalPages: Number(res.data?.totalPages ?? 0),
    };
};

export const useUsers = (
    params: UserListParams = {},
    options: Partial<UseQueryOptions<UserListResponse, AxiosError>> = {}
) =>
    useQuery<UserListResponse, AxiosError>({
        queryKey: QUERY_KEYS.USER_LIST(params),
        queryFn: () => listUsersApi(params),
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
        ...options,
    });

export const useSellers = (options: Partial<UseQueryOptions<UserListResponse, AxiosError>> = {}) =>
    useUsers({ role: "seller", limit: 100 }, options);

export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isEmailVerified?: boolean;
}

export interface UserMutationResponse {
    success: boolean;
    data: { id: number };
}

const createUserApi = async (payload: CreateUserPayload): Promise<UserMutationResponse> => {
    const res = await axiosInstance.post(USER_ENDPOINTS.CREATE, payload);
    return res.data;
};

export const useCreateUser = (
    options: Partial<UseMutationOptions<UserMutationResponse, AxiosError, CreateUserPayload>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUserApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};
