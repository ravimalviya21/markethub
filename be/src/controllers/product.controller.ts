import asyncHandler from "../utils/asyncHandler";
import STATUS_CODES from "../contants/statusCode";
import ProductService, { productViewer } from "../services/product.service";
import { AuthUser, UserRole } from "../types/models";
import { ListProductsQuery } from "../validations/product.validation";

const ProductController = {
    create: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const product = await ProductService.create({
            ...req.body,
            userId: user.id,
            role: user.role as UserRole,
        });
        res.status(STATUS_CODES.CREATED).json({
            success: true,
            data: product,
        });
    }),
    update: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const product = await ProductService.update({
            ...req.body,
            id: Number(req.params.id),
            userId: user.id,
            role: user.role as UserRole,
        });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: product,
        });
    }),
    updateStatus: asyncHandler(async (req, res) => {
        const user = req.user as AuthUser;
        const product = await ProductService.updateStatus({
            status: req.body.status,
            id: Number(req.params.id),
            userId: user.id,
            role: user.role as UserRole,
        });
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: product,
        });
    }),
    find: asyncHandler(async (req, res) => {
        const result = await ProductService.find(
            req.validatedQuery as ListProductsQuery,
            productViewer(req.user as AuthUser | undefined)
        );
        res.status(STATUS_CODES.OK).json({
            success: true,
            ...result,
        });
    }),
    findById: asyncHandler(async (req, res) => {
        const product = await ProductService.findById(
            Number(req.params.id),
            productViewer(req.user as AuthUser | undefined)
        );
        res.status(STATUS_CODES.OK).json({
            success: true,
            data: product,
        });
    }),
};

export default ProductController;
