const pool = require("../config/db");

const CategoryModel = {
    async save({ parentId, displayName, imageUrl, isActive, userId }) {
        const [result] = await pool.execute(
            `INSERT INTO 
            categories (parentId, 
            displayName, 
            imageUrl, 
            isActive, 
            createdBy, 
            updatedBy) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [parentId ?? null, displayName, imageUrl, isActive, userId, userId])
        return result.insertId;
    },
    async update({ id, displayName, isActive, userId }) {
        const [result] = await pool.execute(
            `UPDATE categories
            SET displayName = ?, isActive = ?, updatedBy = ? 
            WHERE id = ?`,
            [displayName, isActive, userId, id]
        )
        return result.affectedRows;
    },
    async find() {
        const [rows] = await pool.execute(`
            SELECT * from categories`)
        return rows
    },
    async findByParentId({ id }) {
        const [rows] = await pool.execute(
            `SELECT * from categories
            WHERE parentId = ?`,
            [id]
        )
        return rows;
    }
}

module.exports = CategoryModel;