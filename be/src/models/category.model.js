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
        const fields = [];
        const values = [];
        if (displayName !== undefined) {
            fields.push("displayName = ?");
            values.push(displayName);
        }
        if (isActive !== undefined) {
            fields.push("isActive = ?");
            values.push(isActive);
        }
        fields.push("updatedBy = ?");
        values.push(userId);
        values.push(id);

        const [result] = await pool.execute(
            `UPDATE categories
            SET ${fields.join(", ")}
            WHERE id = ?`,
            values
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