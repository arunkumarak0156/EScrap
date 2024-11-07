const mongoose = require('mongoose');
const DebitNoteSchema = new mongoose.Schema({
	division: {
		type: String,
		maxlength: 2,
		uppercase: true,
	},
	type: {
		type: String,
		maxlength: 3,
	},
	id: {
		type: String,
		maxlength: 11,
	},
	idt: {
		type: Date,
	},
	adv_no: {
		type: String,
		maxlength: 12,
	},
	purchase_order_no: {
		type: String,
		maxlength: 12,
	},
	purchase_receipt_no: {
		type: String,
		maxlength: 12,
	},
	gate_pass_no: {
		type: String,
		maxlength: 12,
	},
	gate_pass_date: {
		type: Date,
	},
	truck_no: {
		type: String,
		maxlength: 40,
	},
	category_name: { type: String, maxLength: 100 },
	catg_name: { type: String, maxLength: 100 },
	qty: { type: Number },
	rate: { type: Number },
	val: { type: Number },
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('DebitNotes', DebitNoteSchema);
