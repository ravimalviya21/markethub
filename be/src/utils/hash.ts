import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || process.env.SALT_ROUND || 10);

const hash = {
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    },

    async verifyPassword(password: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(password, hashed);
    },
};

export default hash;
