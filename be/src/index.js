require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const dbHealth = require("./utils/dbHealth");
const pool = require('./config/db');
const routes = require("./routes/index");
const passport = require("./utils/passport");
require("./worker/email.worker");
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
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/api", routes);


app.listen(PORT, () => {
    console.log("Server is running", PORT)
})