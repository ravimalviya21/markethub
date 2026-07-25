import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// {
//         host: process.env.DB_HOST,
//         port: Number(process.env.DB_PORT) || 3306,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASS,
//         database: process.env.DB,
//         waitForConnections: true,
//         connectionLimit: 10,
//         queueLimit: 0,
//     }

const pool = mysql
    .createPool(String(process.env.DB_URL))
    .promise();

pool.getConnection()
    .then((conn) => {
        console.log("Connected to DB");
        conn.release();
    })
    .catch((err) => {
        console.error("Connection failed:", err);
    });

export default pool;
