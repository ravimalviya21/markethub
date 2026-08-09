import {
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
    useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "@/config/axios";
import { ORDER_ENDPOINTS, QUERY_KEYS } from "@/contants/endPoints";

export const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface ShippingAddress {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface OrderItemPayload {
    productId: number;
    quantity: number;
}

export interface CreateOrderPayload {
    items: OrderItemPayload[];
    shippingAddress: ShippingAddress;
}

export interface CreatedOrder {
    id: number;
    orderNumber: string;
    sellerId?: number;
    itemCount: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
}

export interface CreateOrderResponse {
    orders: CreatedOrder[];
}

export interface Order {
    id: number;
    orderNumber: string;
    buyerId: number;
    sellerId: number;
    status: OrderStatus;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingAddress: ShippingAddress;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderListResponse {
    items: Order[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface OrderListParams {
    page?: number;
    limit?: number;
    status?: OrderStatus;
}

const normalizeAmounts = <T extends { subtotal: number; shippingCost: number; tax: number; total: number }>(
    row: T
): T => ({
    ...row,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shippingCost),
    tax: Number(row.tax),
    total: Number(row.total),
});

const createOrderApi = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const res = await axiosInstance.post(ORDER_ENDPOINTS.CREATE, payload);
    const orders = res.data?.data?.orders ?? [];
    return { orders: Array.isArray(orders) ? orders.map(normalizeAmounts) : [] };
};

const listOrdersApi = async (params: OrderListParams): Promise<OrderListResponse> => {
    const res = await axiosInstance.get(ORDER_ENDPOINTS.LIST, { params });
    const items = Array.isArray(res.data?.items) ? res.data.items.map(normalizeAmounts) : [];
    return {
        items,
        page: Number(res.data?.page ?? 1),
        limit: Number(res.data?.limit ?? items.length),
        total: Number(res.data?.total ?? items.length),
        totalPages: Number(res.data?.totalPages ?? 0),
    };
};

export const useOrders = (
    params: OrderListParams = {},
    options: Partial<UseQueryOptions<OrderListResponse, AxiosError>> = {}
) =>
    useQuery<OrderListResponse, AxiosError>({
        queryKey: QUERY_KEYS.ORDER_LIST(params),
        queryFn: () => listOrdersApi(params),
        staleTime: 30 * 1000,
        ...options,
    });

export const useCreateOrder = (
    options: Partial<UseMutationOptions<CreateOrderResponse, AxiosError, CreateOrderPayload>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrderApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};
