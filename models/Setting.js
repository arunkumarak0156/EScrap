const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
	port: {
		type: String,
	},
	timeInterval: {
		type: Number,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Setting', SettingSchema);
