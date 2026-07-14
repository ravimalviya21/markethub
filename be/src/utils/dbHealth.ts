import pool from "../config/db";

async function checkDbHealth(): Promise<boolean> {
    try {
        await pool.query("SELECT 1");
        return true; // DB is reachable
    } catch (err) {
        return false; // DB is down / unreachable
    }
}

export default checkDbHealth;
