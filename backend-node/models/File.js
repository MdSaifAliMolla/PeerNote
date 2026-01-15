const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const File = sequelize.define('File', {
    filename: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    is_disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    disabled_reason: {
        type: DataTypes.STRING,
        allowNull: true
    }
    // Foreign Keys will be handled in associations (index.js)
    // original_author -> User
    // topic -> Topic
    // professor -> Professor
    // semester -> Semester
    // course -> Course

    // M2M associations:
    // peer_users -> User (shared_files)
    // upvotes -> User
    // downvotes -> User
}, {
    getterMethods: {
    
    }
});

module.exports = File;
