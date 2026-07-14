import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dbHealth from "./utils/dbHealth";
import routes from "./routes/index";
import passport from "./utils/passport";
import "./worker/email.worker";

const app = express();
const PORT = process.env.PORT || 3003;
dbHealth();

app.use((req, res, next) => {
    console.log("CORS_ORIGIN env:", process.env.CORS_ORIGIN);
    console.log("Request origin:", req.headers.origin);
    next();
});

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/api", routes);

app.listen(PORT, () => {
    console.log("Server is running", PORT);
});
