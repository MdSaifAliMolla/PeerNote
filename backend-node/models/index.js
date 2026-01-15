const sequelize = require('../config/database');
const User = require('./User');
const Topic = require('./Topic');
const Professor = require('./Professor');
const Semester = require('./Semester');
const Course = require('./Course');
const File = require('./File');
const UserReport = require('./UserReport');

// File Associations
File.belongsTo(User, { as: 'original_author', foreignKey: 'original_author_id' });
User.hasMany(File, { as: 'owned_files', foreignKey: 'original_author_id' });

File.belongsTo(Topic, { as: 'topic', foreignKey: 'topic_id' });
Topic.hasMany(File, { as: 'files', foreignKey: 'topic_id' });

File.belongsTo(Professor, { as: 'professor', foreignKey: 'professor_id' });
Professor.hasMany(File, { as: 'files', foreignKey: 'professor_id' });

File.belongsTo(Semester, { as: 'semester', foreignKey: 'semester_id' });
Semester.hasMany(File, { as: 'files', foreignKey: 'semester_id' });

File.belongsTo(Course, { as: 'course', foreignKey: 'course_id' });
Course.hasMany(File, { as: 'files', foreignKey: 'course_id' });

// Many-to-Many
File.belongsToMany(User, { as: 'peer_users', through: 'FilePeers' });
User.belongsToMany(File, { as: 'shared_files', through: 'FilePeers' });

File.belongsToMany(User, { as: 'upvotes', through: 'FileUpvotes' });
User.belongsToMany(File, { as: 'upvoted_file', through: 'FileUpvotes' });

File.belongsToMany(User, { as: 'downvotes', through: 'FileDownvotes' });
User.belongsToMany(File, { as: 'downvoted_file', through: 'FileDownvotes' });

// UserReport Associations
UserReport.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(UserReport, { as: 'user_report', foreignKey: 'user_id' });

UserReport.belongsTo(User, { as: 'reporting_user', foreignKey: 'reporting_user_id' });
User.hasMany(UserReport, { as: 'user_report_generated', foreignKey: 'reporting_user_id' });

UserReport.belongsTo(File, { as: 'file', foreignKey: 'file_id' });
File.hasMany(UserReport, { as: 'file_report', foreignKey: 'file_id' });

module.exports = {
    sequelize,
    User,
    Topic,
    Professor,
    Semester,
    Course,
    File,
    UserReport
};
