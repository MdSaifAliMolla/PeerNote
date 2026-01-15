const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Sync
sequelize.sync()
    .then(() => {
        console.log('Database synced');
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('PeerNotes Backend Node API');
});

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
