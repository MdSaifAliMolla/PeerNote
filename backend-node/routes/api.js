const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const authController = require('../controllers/authController');
const topicController = require('../controllers/topicController');
const professorController = require('../controllers/professorController');
const semesterController = require('../controllers/semesterController');
const courseController = require('../controllers/courseController');
const fileController = require('../controllers/fileController');
const userController = require('../controllers/userController');

// Auth
router.post('/login/', authController.login);
router.post('/signup/', authController.signup);
router.post('/poll/', authMiddleware, authController.pollOnline);

// Topics
router.get('/topics/', authMiddleware, topicController.listCreate);
router.post('/topics/', authMiddleware, topicController.listCreate);
router.get('/topics/:pk/', authMiddleware, topicController.retrieveUpdateDestroy);
router.put('/topics/:pk/', authMiddleware, topicController.retrieveUpdateDestroy);
router.patch('/topics/:pk/', authMiddleware, topicController.retrieveUpdateDestroy);
router.delete('/topics/:pk/', authMiddleware, topicController.retrieveUpdateDestroy);

// Professors
router.get('/professors/', authMiddleware, professorController.listCreate);
router.post('/professors/', authMiddleware, professorController.listCreate);
router.get('/professors/:pk/', authMiddleware, professorController.retrieveUpdateDestroy);
router.put('/professors/:pk/', authMiddleware, professorController.retrieveUpdateDestroy);
router.patch('/professors/:pk/', authMiddleware, professorController.retrieveUpdateDestroy);
router.delete('/professors/:pk/', authMiddleware, professorController.retrieveUpdateDestroy);

// Semesters
router.get('/semesters/', authMiddleware, semesterController.listCreate);
router.post('/semesters/', authMiddleware, semesterController.listCreate);
router.get('/semesters/:pk/', authMiddleware, semesterController.retrieveUpdateDestroy);
router.put('/semesters/:pk/', authMiddleware, semesterController.retrieveUpdateDestroy);
router.patch('/semesters/:pk/', authMiddleware, semesterController.retrieveUpdateDestroy);
router.delete('/semesters/:pk/', authMiddleware, semesterController.retrieveUpdateDestroy);

// Courses
router.get('/courses/', authMiddleware, courseController.listCreate);
router.post('/courses/', authMiddleware, courseController.listCreate);
router.get('/courses/:pk/', authMiddleware, courseController.retrieveUpdateDestroy);
router.put('/courses/:pk/', authMiddleware, courseController.retrieveUpdateDestroy);
router.patch('/courses/:pk/', authMiddleware, courseController.retrieveUpdateDestroy);
router.delete('/courses/:pk/', authMiddleware, courseController.retrieveUpdateDestroy);

// Files
router.get('/files/', authMiddleware, fileController.listCreate);
router.post('/files/', authMiddleware, fileController.listCreate); // Standard create

router.get('/files/filter/', authMiddleware, fileController.filterFiles);

router.get('/files/:pk/', authMiddleware, fileController.retrieveUpdateDestroy);
router.put('/files/:pk/', authMiddleware, fileController.retrieveUpdateDestroy);
router.patch('/files/:pk/', authMiddleware, fileController.retrieveUpdateDestroy);
router.delete('/files/:pk/', authMiddleware, fileController.retrieveUpdateDestroy);

router.post('/files/:fileViewId/upvote/', authMiddleware, fileController.upvoteFile);
router.post('/files/:fileViewId/downvote/', authMiddleware, fileController.downvoteFile);
router.post('/files/:fileViewId/add-peer/', authMiddleware, fileController.addPeerToFile);

router.post('/register/', authMiddleware, fileController.registerFile); // Specialized Create

router.get('/get-peer-files/', authMiddleware, fileController.getUserFiles);

const adminController = require('../controllers/adminController');

// Admin
// User Moderation
router.get('/admin/users/', authMiddleware, adminMiddleware, userController.listUsers);
router.post('/admin/users/:userId/toggle-admin/', authMiddleware, adminMiddleware, userController.toggleAdmin);
router.post('/admin/users/:userId/ban/', authMiddleware, adminMiddleware, userController.banUser);
router.post('/admin/users/:userId/unban/', authMiddleware, adminMiddleware, userController.unbanUser);

// File Moderation
router.get('/admin/files/', authMiddleware, adminMiddleware, adminController.listAllFiles);
router.post('/admin/files/:fileId/disable/', authMiddleware, adminMiddleware, adminController.disableFile);
router.post('/admin/files/:fileId/enable/', authMiddleware, adminMiddleware, adminController.enableFile);
router.delete('/admin/files/:fileId/', authMiddleware, adminMiddleware, adminController.deleteFile);


// Stats
router.get('/admin/stats/', authMiddleware, adminMiddleware, adminController.getSystemStats);

module.exports = router;
