const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_poll: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    is_banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    ban_reason: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
    }
});
// method to check password
User.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = User;
