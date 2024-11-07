const mongoose = require('mongoose');
const PcrSchema = new mongoose.Schema({
	division: {
		type: String,
		maxLength: 2,
		uppercase: true,
	},
	type: {
		type: String,
		maxLength: 3,
	},
	id: {
		type: String,
		maxLength: 11,
	},
	idt: {
		type: Date,
	},
	purchase_order_no: {
		type: String,
		maxLength: 12,
	},
	purchase_recipt_no: {
		type: String,
		maxLength: 12,
	},
	gate_pass_no: { type: String, maxLength: 15 },
	truck_no: { type: String, maxLength: 15 },
	icdp: { type: String, maxLength: 20 },
	itnm: { type: String, maxLength: 150 },
	qty: { type: Number },
	rate: { type: Number },
	upgst_amt: { type: Number },
	cgst_amt: { type: Number },
	igst_amt: { type: Number },
	val: { type: Number },
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
module.exports = mongoose.model('Pcrs', PcrSchema);
