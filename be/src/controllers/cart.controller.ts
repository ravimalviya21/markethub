import asyncHandler from "../utils/asyncHandler";
import STATUS_CODES from "../contants/statusCode";
import CartService from "../services/cart.service";
import { AuthUser } from "../types/models";

const CartController = {
    get: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const cart = await CartService.get(user.id);
        res.status(STATUS_CODES.OK).json({ success: true, data: cart });
    }),

    add: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const cart = await CartService.add({
            userId: user.id,
            productId: req.body.productId,
            quantity: req.body.quantity,
        });
        res.status(STATUS_CODES.OK).json({ success: true, data: cart });
    }),

    updateQuantity: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const cart = await CartService.updateQuantity({
            userId: user.id,
            productId: Number(req.params.productId),
            quantity: req.body.quantity,
        });
        res.status(STATUS_CODES.OK).json({ success: true, data: cart });
    }),

    remove: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const cart = await CartService.remove(user.id, Number(req.params.productId));
        res.status(STATUS_CODES.OK).json({ success: true, data: cart });
    }),

    clear: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const cart = await CartService.clear(user.id);
        res.status(STATUS_CODES.OK).json({ success: true, data: cart });
    }),
};

export default CartController;
