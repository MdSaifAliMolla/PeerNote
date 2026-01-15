const { Professor } = require('../models');
const { Op } = require('sequelize');

exports.listCreate = async (req, res) => {
    if (req.method === 'GET') {
        const { search } = req.query;
        const where = {};
        if (search) where.name = { [Op.like]: `%${search}%` };
        const items = await Professor.findAll({ where });
        return res.json(items);
    } else if (req.method === 'POST') {
        try {
            const item = await Professor.create(req.body);
            return res.status(201).json(item);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
};

exports.retrieveUpdateDestroy = async (req, res) => {
    const { pk } = req.params;
    try {
        const item = await Professor.findByPk(pk);
        if (!item) return res.status(404).json({ detail: 'Not found.' });

        if (req.method === 'GET') {
            return res.json(item);
        } else if (req.method === 'PUT' || req.method === 'PATCH') {
            await item.update(req.body);
            return res.json(item);
        } else if (req.method === 'DELETE') {
            await item.destroy();
            return res.status(204).send();
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
