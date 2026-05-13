import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { setAccessToken } from "@/config/axios";
import { AUTH_ENDPOINTS, QUERY_KEYS } from "@/contants/endPoints";

const signupApi = async (payload) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.SIGNUP, payload);
    return res.data;
};

const loginApi = async (payload) => {
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

const verifyEmailApi = async (token) => {
    const res = await axiosInstance.get(AUTH_ENDPOINTS.VERIFY_EMAIL, {
        params: { token },
    });
    return res.data;
};

const forgotPasswordApi = async (payload) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload);
    return res.data;
};

const resetPasswordApi = async (payload) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload);
    return res.data;
};

const getMeApi = async () => {
    const res = await axiosInstance.get(AUTH_ENDPOINTS.GET_ME);
    return res.data;
};


export const useMe = (options = {}) =>
    useQuery({
        queryKey: QUERY_KEYS.ME,
        queryFn: getMeApi,
        retry: false,
        staleTime: 5 * 60 * 1000,
        ...options,
    });

export const useVerifyEmail = (token, options = {}) =>
    useQuery({
        queryKey: ["auth", "verify-email", token],
        queryFn: () => verifyEmailApi(token),
        enabled: !!token,
        retry: false,
        ...options,
    });

export const useSignup = (options = {}) => {
    return useMutation({
        mutationFn: signupApi,
        ...options,
    });
}

export const useLogin = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loginApi,
        ...options,
        onSuccess: (data, variables, context) => {
            const accessToken = data?.data?.accessToken;
            if (accessToken) setAccessToken(accessToken);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
            options.onSuccess?.(data, variables, context);
        },
    });
};

export const useLogout = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logoutApi,
        ...options,
        onSuccess: (data, variables, context) => {
            setAccessToken(null);
            queryClient.removeQueries({ queryKey: QUERY_KEYS.ME });
            options.onSuccess?.(data, variables, context);
        },
    });
};

export const useRefreshToken = (options = {}) =>
    useMutation({
        mutationFn: refreshTokenApi,
        ...options,
        onSuccess: (data, variables, context) => {
            const accessToken = data?.data?.accessToken;
            if (accessToken) setAccessToken(accessToken);
            options.onSuccess?.(data, variables, context);
        },
    });

export const useForgotPassword = (options = {}) =>
    useMutation({
        mutationFn: forgotPasswordApi,
        ...options,
    });

export const useResetPassword = (options = {}) =>
    useMutation({
        mutationFn: resetPasswordApi,
        ...options,
    });
