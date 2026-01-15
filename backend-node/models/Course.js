const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    name: {
        type: DataTypes.STRING(40),
        allowNull: true // blank=True
    },
    number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    }
});

module.exports = Course;
