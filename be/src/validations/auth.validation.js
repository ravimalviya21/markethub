const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z
        .string()
        .min(8)
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    role: z.enum(['buyer', 'seller']).default('buyer'),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    id: z.string(),
    token: z.string().min(1),
    password: z
        .string()
        .min(8)
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};