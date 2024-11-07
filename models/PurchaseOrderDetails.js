const mongoose = require('mongoose');
const PurchaseOrderDetailSchema = new mongoose.Schema({
	divisions: {
		type: String,
		maxLength: 2,
		uppercase: true,
	},
	order_no: {
		type: String,
		maxLength: 12,
	},
	order_date: {
		type: Date,
	},
	pr_cno: {
		type: String,
		maxLength: 6,
	},
	category_name: { type: String, maxLength: 100 },
	gate_pass_no: { type: String, maxLength: 8 },
	rate: { type: Number },
	qty: { type: Number },
	rec_qty: { type: Number },
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model(
	'PurchaseOrderDetails',
	PurchaseOrderDetailSchema
);
