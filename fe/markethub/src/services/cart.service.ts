import {
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
    useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "@/config/axios";
import { CART_ENDPOINTS, QUERY_KEYS } from "@/contants/endPoints";
import { ProductStatus } from "@/services/product.service";
import { useSession } from "@/config/session";

export interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    name: string;
    slug: string;
    price: number;
    mrp: number | null;
    stock: number;
    status: ProductStatus;
    sellerId: number;
    sellerName: string | null;
    primaryImageUrl: string | null;
    available: boolean;
    lineTotal: number;
    lineMrpTotal: number;
}

export interface CartSummary {
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    mrpTotal: number;
    productDiscount: number;
    unavailableCount: number;
}

export interface Cart {
    items: CartItem[];
    summary: CartSummary;
}

export interface AddCartItemPayload {
    productId: number;
    quantity?: number;
}

export interface UpdateCartItemPayload {
    productId: number;
    quantity: number;
}

export const EMPTY_CART: Cart = {
    items: [],
    summary: {
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        mrpTotal: 0,
        productDiscount: 0,
        unavailableCount: 0,
    },
};

const normalizeItem = (item: CartItem): CartItem => ({
    ...item,
    price: Number(item.price),
    mrp: item.mrp == null ? null : Number(item.mrp),
    lineTotal: Number(item.lineTotal),
    lineMrpTotal: Number(item.lineMrpTotal),
});

const normalizeCart = (data: Cart | undefined): Cart => {
    if (!data) return EMPTY_CART;
    return {
        items: Array.isArray(data.items) ? data.items.map(normalizeItem) : [],
        summary: { ...EMPTY_CART.summary, ...data.summary },
    };
};

const getCartApi = async (): Promise<Cart> => {
    const res = await axiosInstance.get(CART_ENDPOINTS.LIST);
    return normalizeCart(res.data?.data);
};

const addCartItemApi = async (payload: AddCartItemPayload): Promise<Cart> => {
    const res = await axiosInstance.post(CART_ENDPOINTS.ADD, payload);
    return normalizeCart(res.data?.data);
};

const updateCartItemApi = async ({ productId, quantity }: UpdateCartItemPayload): Promise<Cart> => {
    const res = await axiosInstance.patch(CART_ENDPOINTS.ITEM(productId), { quantity });
    return normalizeCart(res.data?.data);
};

const removeCartItemApi = async (productId: number): Promise<Cart> => {
    const res = await axiosInstance.delete(CART_ENDPOINTS.ITEM(productId));
    return normalizeCart(res.data?.data);
};

const clearCartApi = async (): Promise<Cart> => {
    const res = await axiosInstance.delete(CART_ENDPOINTS.CLEAR);
    return normalizeCart(res.data?.data);
};

export const useCart = (options: Partial<UseQueryOptions<Cart, AxiosError>> = {}) =>
    useQuery<Cart, AxiosError>({
        queryKey: QUERY_KEYS.CART,
        queryFn: getCartApi,
        staleTime: 30 * 1000,
        retry: false,
        ...options,
    });

export const useBuyerCart = (options: Partial<UseQueryOptions<Cart, AxiosError>> = {}) => {
    const { isAuthenticated, role } = useSession();
    return useCart({ enabled: isAuthenticated && role === "buyer", ...options });
};

const useCartMutation = <TVariables>(
    mutationFn: (variables: TVariables) => Promise<Cart>,
    options: Partial<UseMutationOptions<Cart, AxiosError, TVariables>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation<Cart, AxiosError, TVariables>({
        mutationFn,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.setQueryData(QUERY_KEYS.CART, data);
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useAddToCart = (
    options: Partial<UseMutationOptions<Cart, AxiosError, AddCartItemPayload>> = {}
) => useCartMutation(addCartItemApi, options);

export const useUpdateCartItem = (
    options: Partial<UseMutationOptions<Cart, AxiosError, UpdateCartItemPayload>> = {}
) => useCartMutation(updateCartItemApi, options);

export const useRemoveCartItem = (
    options: Partial<UseMutationOptions<Cart, AxiosError, number>> = {}
) => useCartMutation(removeCartItemApi, options);

export const useClearCart = (options: Partial<UseMutationOptions<Cart, AxiosError, void>> = {}) =>
    useCartMutation(clearCartApi, options);
