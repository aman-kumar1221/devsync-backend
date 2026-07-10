const express =  require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');


const workspaceRoutes = require('./routes/workspaceRoutes');
const authRoutes = require('./routes/auth'); 
const applicationRoutes = require('./routes/applicationRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 8000;


const mongoURI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/devsync';
mongoose.connect(mongoURI)
  .then(() => console.log('🚀 MongoDB Connected Successfully'))
  .catch((err) => console.error(' Database Connection Failed:', err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/workspace', workspaceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);

// Base Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));