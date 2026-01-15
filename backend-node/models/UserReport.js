const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserReport = sequelize.define('UserReport', {
    description: {
        type: DataTypes.TEXT, // max_length=300 in Django, TEXT is fine or STRING(300)
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
        defaultValue: 'pending'
    }
    // Foreign Keys:
    // user -> User (malicious)
    // reporting_user -> User
    // file -> File
});

module.exports = UserReport;
