const mongoose = require('mongoose');
const GrossTareSchema = new mongoose.Schema({
	gp_division: {
		type: String,
		maxLength: 2,
		uppercase: true,
	},
	gate_pass_no: {
		type: String,
		maxLength: 8,
		required: [true, `Gate Pass No Required`],
	},
	truck_no: {
		type: String,
		maxLength: 15,
	},
	token_id: { type: Number, maxLength: 8 },
	gate_pass_date: { type: Date },
	gross_wt: { type: Number },
	tare_wt: { type: Number },
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('GrossTares', GrossTareSchema);
