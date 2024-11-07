const mongoose = require('mongoose');

const GateDetailsSchema = new mongoose.Schema({
	gp_division: {
		type: String,
		maxLength: 2,
		uppercase: true,
	},
	gate_pass_no: {
		type: String,
		maxLength: 8,
	},
	gate_pass_date: {
		type: Date,
	},
	truck_no: {
		type: String,
		maxLength: 15,
	},
	bill_no: {
		type: String,
		maxlength: 20,
	},
	bill_date: {
		type: Date,
	},
	party_code: { type: String, maxLength: 14 },
	party_name: { type: String, maxLength: 100 },
	purchase_order_no: { type: String, maxlength: 12 },
	indent_number: { type: String, maxLength: 12 },
	gate_pass_icdp: { type: String, maxLength: 20 },
	itnm: { type: String, maxLength: 150 },
	gate_pass_qty: { type: Number },
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('GateDetails', GateDetailsSchema);
