const mongoose = require('mongoose');

const TransactionsSchema = new mongoose.Schema({
	division: {
		type: mongoose.Schema.ObjectId,
		ref: 'Division',
		required: [true, 'Please Add Division'],
	},
	type: {
		type: mongoose.Schema.ObjectId,
		ref: 'Type',
		required: [true, `Please Add Type`],
	},
	subType: {
		type: mongoose.Schema.ObjectId,
		ref: 'SubType',
		required: [true, `Please Add Sub Type`],
	},
	vehicleNo: {
		type: String,
		required: [true, `Please Add Vehicle Number`],
	},
	gateInOut: {
		type: [String],
		required: [true, `Please Add Gate In Out Number`],
	},
	partyName: {
		type: String,
		required: [true, `Please Add Party Name`],
	},
	partyCode: {
		type: String,
	},
	gatePassNumber: {
		type: String,
		required: [true, `Please Add Gate Pass Number`],
		unique: true,
	},
	gatePassDate: {
		type: Date,
	},
	entryDate: {
		type: Date,
	},
	remark: {
		type: String,
	},
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
	active: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

TransactionsSchema.pre('remove', async function (next) {
	await this.model('Images').deleteMany({ transactionId: this._id });
	await this.model('Thumbnails').deleteMany({ transactionId: this._id });
	next();
});

module.exports = mongoose.model('Transactions', TransactionsSchema);
