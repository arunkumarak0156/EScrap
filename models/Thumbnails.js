const mongoose = require('mongoose');
const Transactions = require('./Transactions');

const ThumbnailsSchema = new mongoose.Schema({
	imageId: String,
	thumbnailName: String,
	captureTime: String,
	thumbnail: String,
	transactionId: {
		type: mongoose.Schema.ObjectId,
		ref: 'TransactionCard',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Thumbnails', ThumbnailsSchema);
