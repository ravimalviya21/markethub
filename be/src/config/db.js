const mysql = require("mysql2");
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

pool.getConnection()
    .then((conn) => {
        console.log("Connected to DB");
        conn.release();
    })
    .catch((err) => {
        console.error("Connection failed:", err);
    });

module.exports = pool;