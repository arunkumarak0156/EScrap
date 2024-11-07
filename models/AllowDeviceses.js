const mongoose = require('mongoose');
const User = require('./Users');

const AllowDevicesesSchema = new mongoose.Schema({
	deviceId: {
		type: String,
		required: [true, 'Plase Add Device IP/IMEI ID'],
		maxlength: [100, `Device ID should less then 100 characters`],
	},
	osType: {
		type: String,
		enum: ['windows', 'android'],
	},
	validity: {
		type: Date,
	},
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: [true, 'Please add User ID'],
	},
	active: {
		type: Boolean,
		default: true,
	},
	allowedAt: {
		type: Date,
		default: Date.now,
	},
});

AllowDevicesesSchema.post('save', async function () {
	await User.findByIdAndUpdate(
		this.userId,
		{ $push: { deviceses: this._id } },
		{
			new: true,
			runValidators: true,
		}
	);
});

module.exports = mongoose.model('AllowDeviceses', AllowDevicesesSchema);
