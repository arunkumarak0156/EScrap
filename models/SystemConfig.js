const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SystemConfigSchema = new mongoose.Schema({
	systemId: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: [true, 'Please add password'],
		minlength: [8, 'Password shoud be 8 characters'],
		match: [
			/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/,
			'Please Add strong Password',
		],
	},
	systemIp: {
		type: String,
		required: true,
	},
	lastLoginTime: {
		type: Date,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

SystemConfigSchema.pre('save', async function () {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

SystemConfigSchema.methods.metchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
