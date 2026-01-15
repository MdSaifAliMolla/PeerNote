const { File, User, Topic, Professor, Semester, Course, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.listCreate = async (req, res) => {
    if (req.method === 'GET') {
        const { search } = req.query;
        const where = {};
        if (search) where.filename = { [Op.like]: `%${search}%` };

        try {
            const files = await File.findAll({
                where,
                include: [
                    { model: User, as: 'original_author', attributes: ['id', 'username'] },
                    { model: Topic, as: 'topic', attributes: ['name'] },
                    { model: Professor, as: 'professor', attributes: ['name'] },
                    { model: Semester, as: 'semester', attributes: ['name'] },
                    { model: Course, as: 'course', attributes: ['name', 'number'] }
                ]
            });
            return res.json(files);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        try {
            const file = await File.create(req.body);
            return res.status(201).json(file);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
};

exports.retrieveUpdateDestroy = async (req, res) => {
    const { pk } = req.params;
    try {
        const file = await File.findByPk(pk, {
            include: [
                { model: User, as: 'original_author', attributes: ['id', 'username'] },
                { model: Topic, as: 'topic', attributes: ['name'] },
                { model: Professor, as: 'professor', attributes: ['name'] },
                { model: Semester, as: 'semester', attributes: ['name'] },
                { model: Course, as: 'course', attributes: ['name', 'number'] }
            ]
        });
        if (!file) return res.status(404).json({ detail: 'Not found.' });

        if (req.method === 'GET') {
            return res.json(file);
        } else if (req.method === 'PUT' || req.method === 'PATCH') {
            await file.update(req.body);
            return res.json(file);
        } else if (req.method === 'DELETE') {
            await file.destroy();
            return res.status(204).send();
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.registerFile = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const user = req.user;
        const data = req.body;

        // Update user last poll
        user.last_poll = new Date();
        await user.save({ transaction: t });

        // Validate required fields
        const required = ['filename', 'topic'];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            await t.rollback();
            return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
        }

        // Create File
        const file = await File.create({
            filename: data.filename,
            original_author_id: user.id
        }, { transaction: t });

        await file.addPeer_user(user, { transaction: t });

        // Link Relations (Course, Professor, Semester)
        if (data.course) {
            const course = await Course.findByPk(data.course); // Assuming ID
            if (course) await file.setCourse(course, { transaction: t });
        }
        if (data.professor) {
            const professor = await Professor.findByPk(data.professor);
            if (professor) await file.setProfessor(professor, { transaction: t });
        }
        if (data.semester) {
            const semester = await Semester.findByPk(data.semester);
            if (semester) await file.setSemester(semester, { transaction: t });
        }

        // Topic Logic
        if (data.topic) {
            let topic = await Topic.findByPk(data.topic);

            if (!topic && typeof data.topic === 'object') {
                topic = await Topic.create(data.topic, { transaction: t });
            }
            if (topic) await file.setTopic(topic, { transaction: t });
        }

        user.points += 1;
        await user.save({ transaction: t });
        await t.commit();

        // Reload to get associations
        await file.reload({ include: ['topic', 'semester', 'course', 'professor'] });

        const responseData = {
            id: file.id,
            filename: file.filename,
            topic: file.topic ? file.topic.name : null,
            semester: file.semester ? file.semester.name : null,
            course: file.course ? file.course.name : null,
            professor: file.professor ? file.professor.name : null,
        };

        return res.status(201).json(responseData);

    } catch (e) {
        await t.rollback();
        console.error(e);
        return res.status(400).json({ "error(s)": "Something went wrong" });
    }
};

exports.upvoteFile = async (req, res) => {
    try {
        const { fileViewId } = req.params; // Using standard id param
        const file = await File.findByPk(fileViewId);
        if (!file) return res.status(400).json({ error: "Please enter valid file id" });

        const user = req.user;

        const hasDownvoted = await file.hasDownvote(user);
        if (hasDownvoted) {
            await file.removeDownvote(user);
        }
        await file.addUpvote(user);

        // Calculate points
        const upvotes = await file.countUpvotes();
        const downvotes = await file.countDownvotes();
        const points = upvotes - downvotes;

        return res.status(200).json({ msg: `Upvoted ${file.filename}`, file_points: points });
    } catch (e) {
        console.error(e);
        return res.status(400).json({ error: "Please enter valid file id" });
    }
};

exports.downvoteFile = async (req, res) => {
    try {
        const { fileViewId } = req.params;
        const file = await File.findByPk(fileViewId);
        if (!file) return res.status(400).json({ error: "Please enter valid file id" });

        const user = req.user;

        const hasUpvoted = await file.hasUpvote(user);
        if (hasUpvoted) {
            await file.removeUpvote(user);
        }
        await file.addDownvote(user);

        const upvotes = await file.countUpvotes();
        const downvotes = await file.countDownvotes();
        const points = upvotes - downvotes;

        return res.status(200).json({ msg: `Downvoted ${file.filename}`, file_points: points });
    } catch (e) {
        console.error(e);
        return res.status(400).json({ error: "Please enter valid file id" });
    }
};

exports.addPeerToFile = async (req, res) => {
    try {
        const { fileViewId } = req.params;
        const file = await File.findByPk(fileViewId);
        if (!file) return res.status(400).json({ error: "Unable to find file" });

        const user = req.user;

        const hasPeer = await file.hasPeer_user(user);
        if (!hasPeer) {
            await file.addPeer_user(user);
        }

        return res.status(200).json(`User added to file with id ${file.id}`);
    } catch (e) {
        return res.status(400).json("Unable to register peer to given file id");
    }
};

exports.filterFiles = async (req, res) => {
    try {
        const { topic, professor, course, semester } = req.query;
        const where = {};

        if (topic) where.topic_id = topic;
        if (professor) where.professor_id = professor;
        if (course) where.course_id = course;
        if (semester) where.semester_id = semester;

        // Filter by active peers
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Find active peers IDs
        const activePeers = await User.findAll({
            where: {
                last_poll: { [Op.gte]: oneHourAgo }
            },
            attributes: ['id']
        });
        const activePeerIds = activePeers.map(u => u.id);

        if (activePeerIds.length === 0) {
            return res.json([]);
        }

        let files = await File.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'peer_users',
                    attributes: ['id', 'username', 'points', 'ip_address', 'last_poll'],
                    through: { attributes: [] },
                    where: { id: { [Op.in]: activePeerIds } },
                },
                { model: User, as: 'original_author', attributes: ['id', 'username', 'ip_address'] },
                { model: Topic, as: 'topic', attributes: ['id', 'name'] },
                { model: Professor, as: 'professor', attributes: ['id', 'name'] },
                { model: Semester, as: 'semester', attributes: ['id', 'name'] },
                { model: Course, as: 'course', attributes: ['id', 'name', 'number'] },
            ]
        });
        files = await Promise.all(files.map(async (file) => {
            const upCount = await file.countUpvotes();
            const downCount = await file.countDownvotes();
            file.points = upCount - downCount;
            return file;
        }));

        files.sort((a, b) => a.points - b.points); 
        files.sort((a, b) => b.points - a.points);

        // Serialize
        // Need to replicate "peer_users" list for each file, sorted by user points.
        const responseData = await Promise.all(files.map(async (f) => {
            const peers = Array.isArray(f.peer_users) ? [...f.peer_users] : [];
            peers.sort((u1, u2) => (u2.points ?? 0) - (u1.points ?? 0));

            const upvotes = await f.getUpvotes({ attributes: ['id'], joinTableAttributes: [] });
            const downvotes = await f.getDownvotes({ attributes: ['id'], joinTableAttributes: [] });

            return {
                id: f.id,
                filename: f.filename,
                points: f.points,
                peer_users: peers.map(p => ({
                    id: p.id,
                    username: p.username,
                    points: p.points,
                    ip_address: p.ip_address,
                    last_poll: p.last_poll,
                })),
                upvotes: upvotes.map(u => u.id),
                downvotes: downvotes.map(u => u.id),
                original_author: {
                    username: f.original_author ? f.original_author.username : '',
                    ip_address: f.original_author ? f.original_author.ip_address : null,
                },
                professor: f.professor ? { id: f.professor.id, name: f.professor.name } : { id: null, name: '' },
                course: f.course ? { id: f.course.id, name: f.course.name, number: f.course.number } : { id: null, name: '', number: '' },
                semester: f.semester ? { id: f.semester.id, name: f.semester.name } : { id: null, name: '' },
                topic: f.topic ? { id: f.topic.id, name: f.topic.name } : { id: null, name: '' },
            };
        }));

        return res.json(responseData);

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: `Something went wrong: ${e.message}` });
    }
};

exports.getUserFiles = async (req, res) => {
    try {
        const user = req.user;
        const include = [
            { model: User, as: 'original_author', attributes: ['id', 'username', 'ip_address'] },
            { model: Topic, as: 'topic', attributes: ['id', 'name'] },
            { model: Professor, as: 'professor', attributes: ['id', 'name'] },
            { model: Semester, as: 'semester', attributes: ['id', 'name'] },
            { model: Course, as: 'course', attributes: ['id', 'name', 'number'] },
        ];

        const owned = await user.getOwned_files({ include });
        const shared = await user.getShared_files({ include });

        // Union manually
        // Convert to map to dedup by ID
        const fileMap = new Map();
        owned.forEach(f => fileMap.set(f.id, f));
        shared.forEach(f => fileMap.set(f.id, f));

        const allFiles = Array.from(fileMap.values());

        return res.json(allFiles);
    } catch (e) {
        return res.status(400).json({ error: `An error occured ${e}` });
    }
};
