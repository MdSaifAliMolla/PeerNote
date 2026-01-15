const { Topic } = require('../models');

exports.listCreate = async (req, res) => {
    if (req.method === 'GET') {
        const { search } = req.query;
        const where = {};
        if (search) {
            const { Op } = require('sequelize');
            where.name = { [Op.like]: `%${search}%` };
        }
        const topics = await Topic.findAll({ where });
        return res.json(topics);
    } else if (req.method === 'POST') {
        try {
            const topic = await Topic.create(req.body);
            return res.status(201).json(topic);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
};

exports.retrieveUpdateDestroy = async (req, res) => {
    const { pk } = req.params;
    try {
        const topic = await Topic.findByPk(pk);
        if (!topic) return res.status(404).json({ detail: 'Not found.' });

        if (req.method === 'GET') {
            return res.json(topic);
        } else if (req.method === 'PUT' || req.method === 'PATCH') {
            await topic.update(req.body);
            return res.json(topic);
        } else if (req.method === 'DELETE') {
            await topic.destroy();
            return res.status(204).send();
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
