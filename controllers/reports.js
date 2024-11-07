const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const Transactions = require('../models/Transactions');
const Division = require('../models/Divison');
const DebitNotes = require('../models/DebitNote');
const Pcrs = require('../models/Pcr');
const GrossTares = require('../models/GrossTare');
const ScrapQualities = require('../models/ScrapQuality');
const PurchaseOrderDetails = require('../models/PurchaseOrderDetails');
const GateDetails = require('../models/GateDetails');

// @decs        Get Transaction By Date
// @routes      GET /api/v1/report/transaction/:from/:to
// @access      Private
exports.searchByDate = asyncHandler(async (req, res, next) => {
	var start = new Date(req.params.from);
	start.setHours(0, 0, 0, 0);

	var end = new Date(req.params.to);
	end.setHours(23, 59, 59, 999);

	const transaction = await Transactions.find({
		createdAt: { $gte: start, $lte: end },
	});

	if (!transaction) {
		return next(new ErrorResponse(`No Transaction Details`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Detail`,
		total: transaction.length,
		data: transaction,
	});
});

// @decs        Get Transaction By Vehical No/Party Name/Gate Pass Number
// @routes      GET /api/v1/report/transaction/:search
// @access      Private
exports.searchBy = asyncHandler(async (req, res, next) => {
	if (req.params.search === ' ') {
		res.status(204).json({
			success: false,
			message: 'Search text not provided',
			data: [],
		});
	}

	const transaction = await Transactions.find({
		$or: [
			{ vehicleNo: { $regex: req.params.search } },
			{ partyName: { $regex: req.params.search } },
			{ gatePassNumber: { $regex: req.params.search } },
		],
	});

	if (!transaction) {
		return next(new ErrorResponse(`No Transaction Details`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Detail`,
		total: transaction.length,
		data: transaction,
	});
});

// @decs        Get Sync Status
// @routes      GET /api/v1/report/datasync/:searchtext/:division
// @access      Private
exports.getTransactionStatus = asyncHandler(async (req, res, next) => {
	let gatedetails = [];
	let debitnote = [];
	let pcr = [];
	let grosstare = [];
	let purchaseorder = [];
	let scrapquality = [];

	if (req.user.role !== 'Vendor') {
		gatedetails = await GateDetails.find({
			$and: [
				{
					$or: [
						{ gate_pass_no: { $regex: req.params.searchtext } },
						{ truck_no: { $regex: req.params.searchtext } },
					],
				},
				{ gp_division: { $regex: req.params.division.toUpperCase() } },
			],
		});

		debitnote = await DebitNotes.find(
			{
				$and: [
					{
						$or: [
							{ gate_pass_no: { $regex: req.params.searchtext } },
							{ truck_no: { $regex: req.params.searchtext } },
						],
					},
					{ division: req.params.division.toUpperCase() },
				],
			},
			{ _id: 0 }
		);

		pcr = await Pcrs.find(
			{
				$and: [
					{
						$or: [
							{ gate_pass_no: { $regex: req.params.searchtext } },
							{ truck_no: { $regex: req.params.searchtext } },
						],
					},
					{ division: req.params.division.toUpperCase() },
				],
			},
			{ _id: 0 }
		);

		grosstare = await GrossTares.find(
			{
				$and: [
					{
						$or: [
							{ gate_pass_no: { $regex: req.params.searchtext } },
							{ truck_no: { $regex: req.params.searchtext } },
						],
					},
					{ gp_division: req.params.division.toUpperCase() },
				],
			},
			{ _id: 0 }
		);

		purchaseorder = await PurchaseOrderDetails.find(
			{
				$and: [
					{
						gate_pass_no: req.params.searchtext,
					},
					{ divisions: req.params.division.toUpperCase() },
				],
			},
			{ _id: 0 }
		);

		scrapquality = await ScrapQualities.find(
			{
				$and: [
					{
						$or: [
							{ gate_pass_no: { $regex: req.params.searchtext } },
							{ truck_no: { $regex: req.params.searchtext } },
						],
					},
					{ division: req.params.division.toUpperCase() },
				],
			},
			{ _id: 0 }
		);
	} else {
		const searchId = await GateDetails.findOne(
			{
				party_code: req.user.vendorId,
			},
			{ gate_pass_no: 1 }
		);

		gatedetails = await GateDetails.find({ gate_pass_no: searchId });
		debitnote = await DebitNotes.find({ gate_pass_no: searchId });
		pcr = await Pcrs.find({ gate_pass_no: searchId });
		grosstare = await GrossTares.find({ gate_pass_no: searchId });
		purchaseorder = await PurchaseOrderDetails.find({ gate_pass_no: searchId });
		scrapquality = await ScrapQualities.find({ gate_pass_no: searchId });
	}

	return res.status(200).json({
		success: true,
		message: 'Report Transaction Status',
		gatedetails,
		debitnote,
		pcr,
		grosstare,
		purchaseorder,
		scrapquality,
	});
});
