const express = require("express");
require("dotenv").config();
const app = express();
const dbHealth = require("./utils/dbHealth");
const pool = require('./config/db');
const routes = require("./routes/index");
const PORT = process.env.PORT || 3003;
dbHealth();

app.use(express.json());
app.use("/api", routes);


app.listen(PORT, () => {
    console.log("Server is running", PORT)
})