const mongoose = require('mongoose');
const Division = require('./Divison');

const TypeSchema = new mongoose.Schema({
	typeName: {
		type: String,
		required: [true, 'Please Add Type Name'],
	},
	division: {
		type: mongoose.Schema.ObjectId,
		required: [true, 'Division Id is missing'],
		ref: 'Division',
	},
	subTypes: {
		type: [mongoose.Schema.ObjectId],
		ref: 'SubType',
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

TypeSchema.post('save', async function () {
	await Division.findByIdAndUpdate(
		{ _id: this.division },
		{ $push: { typeId: this._id } },
		{
			new: true,
			runValidators: true,
		}
	);
});

module.exports = mongoose.model('Type', TypeSchema);
