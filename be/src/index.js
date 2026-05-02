const express = require("express");
const app = express();
require("dotenv").config();
const dbHealth = require("./utils/dbHealth");
const pool = require('./config/db');
dbHealth();


const getUsers = async () => {
    try {
        const [rows] = await pool.query("select * from users");
        console.log(rows);
    } catch(err) {
        console.log("getting error", err)
    }
}
getUsers();
const PORT = 3002;

app.listen(PORT, () => {
    console.log("Server is running", PORT)
})