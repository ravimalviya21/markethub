import asyncHandler from "../utils/asyncHandler";
import STATUS_CODES from "../contants/statusCode";
import OrderService, { orderViewer } from "../services/order.service";
import { AuthUser, UserRole } from "../types/models";
import { ListOrdersQuery } from "../validations/order.validation";

const OrderController = {
    create: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const order = await OrderService.create({
            ...req.body,
            userId: user.id,
        });
        res.status(STATUS_CODES.CREATED).json({
            success: true,
            data: order,
        });
    }),
    updateStatus: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const order = await OrderService.updateStatus({
            status: req.body.status,
            id: Number(req.params.id),
            userId: user.id,
            role: user.role as UserRole,
        });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: order,
        });
    }),
    find: asyncHandler(async (req, res) => {
        const result = await OrderService.find(
            req.validatedQuery as ListOrdersQuery,
            orderViewer(req.user as AuthUser)
        );
        res.status(STATUS_CODES.OK).json({
            success: true,
            ...result,
        });
    }),
    findById: asyncHandler(async (req, res) => {
        const order = await OrderService.findById(
            Number(req.params.id),
            orderViewer(req.user as AuthUser)
        );
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: order,
        });
    }),
};

export default OrderController;
