const mongoose = require('mongoose');

const LoggerSchema = new mongoose.Schema({
	logType: {
		type: String,
		enum: ['error', 'warning', 'info'],
	},
	method: {
		type: String,
	},
	message: {
		type: String,
	},
	user: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: new Date(),
	},
});

module.exports = mongoose.model('Logger', LoggerSchema);
