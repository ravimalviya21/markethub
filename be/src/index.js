const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const dbHealth = require("./utils/dbHealth");
const pool = require('./config/db');
const routes = require("./routes/index");
require("./worker/email.worker");
const PORT = process.env.PORT || 3003;
dbHealth();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);


app.listen(PORT, () => {
    console.log("Server is running", PORT)
})