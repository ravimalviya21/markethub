const pool = require('../config/db');

async function checkDbHealth() {
    try {
        const [rows] = await pool.query("SELECT 1");
        return true; // DB is reachable
    } catch (err) {
        return false; // DB is down / unreachable
    }
}

module.exports = checkDbHealth;