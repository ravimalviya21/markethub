const bcrypt = require('bcrypt');
require('dotenv').config();

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || process.env.SALT_ROUND || 10);

const hash = {
    async hashPassword(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    },

    async verifyPassword(password, hashed) {
        return bcrypt.compare(password, hashed);
    },
};

module.exports = hash;
