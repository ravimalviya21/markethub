const bcrypt = require('bcrypt');
require('dotenv').config();

const SALT_ROUNDS = process.env.SALT_ROUNDS;

const hash = {
    async hashPassword(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    },

    async verifyPassword(password, hashed) {
        return bcrypt.compare(password, hashed);
    },
};

module.exports = hash;
