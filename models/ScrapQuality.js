const mongoose = require('mongoose');
const ScrapQualitySchema = new mongoose.Schema({
	division: {
		type: String,
		maxlength: 2,
		required: true,
		uppercase: true,
	},
	divisionId: {
		type: String,
		maxlength: 10,
	},
	date: {
		type: Date,
	},
	gate_pass_no: {
		type: String,
		maxlength: 8,
		required: true,
	},
	gate_pass_date: {
		type: Date,
	},
	truck_no: {
		type: String,
		maxLength: 15,
	},
	item_category: { type: String, maxLength: 20 },
	category_name: { type: String, maxLength: 100 },
	weight: { type: Number },
	per: { type: Number },
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
module.exports = mongoose.model('ScrapQualities', ScrapQualitySchema);
