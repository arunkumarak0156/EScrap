const mongoose = require('mongoose');

const DivisionSchema = new mongoose.Schema({
	division: {
		type: String,
		required: [true, 'Please add Division'],
	},
	divisionName: {
		type: String,
		required: [true, 'Please add Division Name'],
	},
	city: {
		type: String,
		required: [true, 'Please add City'],
	},
	unit: {
		type: String,
		required: [true, 'Please add Unit'],
		uppercase: true,
	},
	active: {
		type: Boolean,
		default: true,
	},
	typeId: {
		type: [mongoose.Schema.ObjectId],
		ref: 'Type',
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

module.exports = mongoose.model('Division', DivisionSchema);
