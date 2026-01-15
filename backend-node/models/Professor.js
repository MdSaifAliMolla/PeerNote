const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Professor = sequelize.define('Professor', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
});

module.exports = Professor;
