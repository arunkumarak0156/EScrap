const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Import Routes
const auth = require('./routes/auth');
const user = require('./routes/user');
const device = require('./routes/allowdeviceses');
const division = require('./routes/division');
const type = require('./routes/type');
const subtype = require('./routes/subtype');
const transactions = require('./routes/transactions');
const report = require('./routes/reports');
const systemconfig = require('./routes/systemconfig');
const setting = require('./routes/setting');
const sync = require('./routes/datasync');
const log = require('./routes/logger');

// Load env
dotenv.config({ path: './config/config.env' });

// Connect to DataBase
connectDB();

const app = express();

// Use JSON Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded());

// Use CORS
app.use(cors());

// Use Routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/user', user);
app.use('/api/v1/device', device);
app.use('/api/v1/division', division);
app.use('/api/v1/type', type);
app.use('/api/v1/subtype', subtype);
app.use('/api/v1/transaction', transactions);
app.use('/api/v1/report', report);
app.use('/api/v1/systemconfig', systemconfig);
app.use('/api/v1/setting', setting);
app.use('/api/v1/sync', sync);
app.use('/api/v1/log', log);

app.use((req, res, next) => {
	return res.status(404).json({
		status: 503,
		error: `${req.originalUrl} Route Not Found`,
	});
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const server = app.listen(
	PORT,
	console.log(
		`Server is runing in ${process.env.NODE_ENV} mode on port ${PORT}`.bgWhite
			.blue.bold
	)
);

process.on('unhandledRejection', (err, promise) => {
	console.log(`Error ${err.message}`);
	server.close(() => process.exit(1));
});
