import {
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
    useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "@/config/axios";
import { PAYMENT_ENDPOINTS, QUERY_KEYS } from "@/contants/endPoints";

export interface PaymentConfig {
    provider: string;
    enabled: boolean;
}

export interface PaymentIntent {
    provider: "razorpay";
    razorpayOrderId: string;
    keyId: string;
    amount: number;
    amountInPaise: number;
    currency: string;
}

export interface VerifyPaymentPayload {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface VerifyPaymentResponse {
    razorpayOrderId: string;
    status: "succeeded";
    orderIds: number[];
}

export interface FailPaymentPayload {
    razorpayOrderId: string;
}

const getPaymentConfigApi = async (): Promise<PaymentConfig> => {
    const res = await axiosInstance.get(PAYMENT_ENDPOINTS.CONFIG);
    return res.data?.data ?? { provider: "razorpay", enabled: false };
};

const verifyPaymentApi = async (payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
    const res = await axiosInstance.post(PAYMENT_ENDPOINTS.VERIFY, payload);
    return res.data?.data;
};

const failPaymentApi = async (payload: FailPaymentPayload) => {
    const res = await axiosInstance.post(PAYMENT_ENDPOINTS.FAILED, payload);
    return res.data?.data;
};

export const usePaymentConfig = (options: Partial<UseQueryOptions<PaymentConfig, AxiosError>> = {}) =>
    useQuery<PaymentConfig, AxiosError>({
        queryKey: QUERY_KEYS.PAYMENT_CONFIG,
        queryFn: getPaymentConfigApi,
        staleTime: 10 * 60 * 1000,
        retry: false,
        ...options,
    });

export const useVerifyPayment = (
    options: Partial<UseMutationOptions<VerifyPaymentResponse, AxiosError, VerifyPaymentPayload>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: verifyPaymentApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useFailPayment = (
    options: Partial<UseMutationOptions<unknown, AxiosError, FailPaymentPayload>> = {}
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: failPaymentApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};
