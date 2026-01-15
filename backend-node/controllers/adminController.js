const { User, File, UserReport, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get System Stats
exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalFiles = await File.count();
        const totalReports = 0;

        // Active peers (last 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const activePeers = await User.count({
            where: {
                last_poll: { [Op.gte]: oneHourAgo }
            }
        });

        res.json({
            totalUsers,
            totalFiles,
            totalReports,
            activePeers
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// List All Files
exports.listAllFiles = async (req, res) => {
    try {
        const { User, Topic } = require('../models');

        const files = await File.findAll({
            include: [
                { model: User, as: 'original_author', attributes: ['username'] },
                { model: Topic, as: 'topic', attributes: ['name'] },
            ],
            order: [['created_at', 'DESC']]
        });

        const fileList = files.map(f => ({
            id: f.id,
            filename: f.filename,
            author: f.original_author ? f.original_author.username : 'Unknown',
            topic: f.topic ? f.topic.name : 'Unknown',
            created_at: f.created_at,
            is_disabled: f.is_disabled,
            disabled_reason: f.disabled_reason,
            report_count: 0, //removed
        }));

        res.json(fileList);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list files' });
    }
};

// ... Actions ...

exports.disableFile = async (req, res) => {
    try {
        const file = await File.findByPk(req.params.fileId);
        if (!file) return res.status(404).json({ error: 'File not found' });

        file.is_disabled = true;
        file.disabled_reason = req.body.reason || 'Admin disabled';
        await file.save();
        res.json({ message: 'File disabled' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to disable file' });
    }
};

exports.enableFile = async (req, res) => {
    try {
        const file = await File.findByPk(req.params.fileId);
        if (!file) return res.status(404).json({ error: 'File not found' });

        file.is_disabled = false;
        file.disabled_reason = null;
        await file.save();
        res.json({ message: 'File enabled' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to enable file' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findByPk(req.params.fileId);
        if (!file) return res.status(404).json({ error: 'File not found' });

        await file.destroy();
        res.json({ message: 'File deleted' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
};
