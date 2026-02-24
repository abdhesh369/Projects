const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const authenticationService = {
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    },

    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    },

    async validateUser(email, password) {
        const user = await User.findByEmail(email);
        if (!user) return null;

        const isMatch = await this.comparePassword(password, user.password_hash);
        if (!isMatch) return null;

        return user;
    }
};

module.exports = authenticationService;
