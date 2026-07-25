import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

interface TokenSubject {
    id: number;
    name?: string;
    email?: string;
    role?: string;
}

const generateAccessToken = (user: TokenSubject): string => {
    return jwt.sign(
        { id: user.id, name: user.name, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = (user: TokenSubject): string => {
    return jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const verifyToken = (token: string, secret: string = JWT_SECRET): string | JwtPayload => {
    return jwt.verify(token, secret);
};

const decodeToken = (token: string): null | string | JwtPayload => {
    return jwt.decode(token);
};

export default { generateAccessToken, generateRefreshToken, verifyToken, decodeToken };
export { generateAccessToken, generateRefreshToken, verifyToken, decodeToken };
