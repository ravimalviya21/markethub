import { AuthUser } from "./models";

export interface GoogleAuthPayload {
    profile: import("passport-google-oauth20").Profile;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser | GoogleAuthPayload;
        }
    }
}

export {};
