import { useMutation, UseMutationOptions, useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { setAccessToken } from "@/config/axios";
import { AUTH_ENDPOINTS, QUERY_KEYS } from "@/contants/endPoints";

interface SignupPayload {
    name: string;
    email: string;
    password: string;
    role?: "buyer" | "seller";
}

interface LoginPayload {
    email: string;
    password: string;
}

interface ForgotPasswordPayload {
    email: string;
}

interface ResetPasswordPayload {
    id?: string | string[];
    token?: string | string[];
    password: string;
}

const signupApi = async (payload: SignupPayload) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.SIGNUP, payload);
    return res.data;
};

const loginApi = async (payload: LoginPayload) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, payload);
    return res.data;
};

const logoutApi = async () => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
    return res.data;
};

const refreshTokenApi = async () => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
    return res.data;
};

const verifyEmailApi = async (token: string | string[] | undefined) => {
    const res = await axiosInstance.get(AUTH_ENDPOINTS.VERIFY_EMAIL, {
        params: { token },
    });
    return res.data;
};

const forgotPasswordApi = async (payload: ForgotPasswordPayload) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload);
    return res.data;
};

const resetPasswordApi = async (payload: ResetPasswordPayload) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload);
    return res.data;
};

const getMeApi = async () => {
    const res = await axiosInstance.get(AUTH_ENDPOINTS.GET_ME);
    return res.data;
};

export const useMe = (options: Partial<UseQueryOptions> = {}) =>
    useQuery({
        queryKey: QUERY_KEYS.ME,
        queryFn: getMeApi,
        retry: false,
        staleTime: 5 * 60 * 1000,
        ...options,
    });

export const useVerifyEmail = (token: string | string[] | undefined, options: Partial<UseQueryOptions> = {}) =>
    useQuery({
        queryKey: ["auth", "verify-email", token],
        queryFn: () => verifyEmailApi(token),
        enabled: !!token,
        retry: false,
        ...options,
    });

export const useSignup = (options: Partial<UseMutationOptions<any, any, SignupPayload>> = {}) => {
    return useMutation({
        mutationFn: signupApi,
        ...options,
    });
};

export const useLogin = (options: Partial<UseMutationOptions<any, any, LoginPayload>> = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loginApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            const accessToken = data?.data?.accessToken;
            if (accessToken) setAccessToken(accessToken);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useLogout = (options: Partial<UseMutationOptions<any, any, void>> = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logoutApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            setAccessToken(null);
            queryClient.removeQueries({ queryKey: QUERY_KEYS.ME });
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useRefreshToken = (options: Partial<UseMutationOptions<any, any, void>> = {}) =>
    useMutation({
        mutationFn: refreshTokenApi,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            const accessToken = data?.data?.accessToken;
            if (accessToken) setAccessToken(accessToken);
            options.onSuccess?.(data, variables, onMutateResult, context);
        },
    });

export const useForgotPassword = (options: Partial<UseMutationOptions<any, any, ForgotPasswordPayload>> = {}) =>
    useMutation({
        mutationFn: forgotPasswordApi,
        ...options,
    });

export const useResetPassword = (options: Partial<UseMutationOptions<any, any, ResetPasswordPayload>> = {}) =>
    useMutation({
        mutationFn: resetPasswordApi,
        ...options,
    });
