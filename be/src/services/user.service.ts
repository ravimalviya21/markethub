import { AppError } from "../utils/errors";
import STATUS_CODES from "../contants/statusCode";
import UserModel from "../models/user.model";
import hash from "../utils/hash";
import { CreateUserInput, ListUsersQuery } from "../validations/user.validation";

const UserService = {
    async create({ name, email, password, role, isEmailVerified }: CreateUserInput) {
        const existing = await UserModel.findByEmail(email);
        if (existing) throw new AppError("A user with this email already exists", STATUS_CODES.CONFLICT);

        const hashedPassword = await hash.hashPassword(password);
        const id = await UserModel.create({ name, email, hashedPassword, role, isEmailVerified });
        return { id };
    },

    async find({ page, limit, role, q }: ListUsersQuery) {
        const { items, total } = await UserModel.find({ page, limit, role, q });
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        };
    },
};

export default UserService;
