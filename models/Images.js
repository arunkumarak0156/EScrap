const mongoose = require('mongoose');
const Transactions = require('./Transactions');

const ImagesSchema = new mongoose.Schema({
	imageId: String,
    imageName: String,
    captureTime: String,
	image: String,
	transactionId: {
		type: mongoose.Schema.ObjectId,
		ref: 'TransactionCard',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Images', ImagesSchema);
