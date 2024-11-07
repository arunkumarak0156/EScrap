const mongoose = require('mongoose');
const Type = require('./Type');

const SubTypeSchema = new mongoose.Schema({
	subTypeName: {
		type: String,
		required: [true, 'Please add Sub Type Name'],
	},
	division: {
		type: mongoose.Schema.ObjectId,
		ref: 'Division',
	},
	type: {
		type: mongoose.Schema.ObjectId,
		ref: 'Type',
	},
	active: {
		type: Boolean,
		default: true,
	},
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

SubTypeSchema.post('save', async function () {
	await Type.findByIdAndUpdate(
		{ _id: this.type },
		{ $push: { subTypes: this._id } },
		{
			new: true,
			runValidators: true,
		}
	);
});

module.exports = mongoose.model('SubType', SubTypeSchema);
