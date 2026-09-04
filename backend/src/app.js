const express = require('express');
const cors = require('cors');
const path = require('path');

const env = require('./config/env');
const healthRoutes = require('./routes/health');
const publicRoutes = require('./routes/public');
const creatorRoutes = require('./routes/creators');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { UPLOAD_DIR } = require('./middleware/upload');

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api', healthRoutes);
app.use('/api', publicRoutes);
app.use('/api', creatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
