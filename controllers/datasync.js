const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const Transactions = require('../models/Transactions');
const Division = require('../models/Divison');
const DebitNotes = require('../models/DebitNote');
const Pcrs = require('../models/Pcr');
const GrossTares = require('../models/GrossTare');
const ScrapQualities = require('../models/ScrapQuality');
const PurchaseOrderDetails = require('../models/PurchaseOrderDetails');
const GateDetails = require('../models/GateDetails');
const { log } = require('./logger');

exports.getUnprossedTransactions = asyncHandler(async (req, res, next) => {
	const gateDetails = await GateDetails.aggregate([
		{
			$lookup: {
				from: 'Transactions',
				as: 'txn',
				localField: 'gate_pass_no',
				foreignField: 'gatePassNumber',
			},
		},
		{ $match: { 'txn.gatePassNumber': { $exists: false } } },
	]);

	const allTxn = await Transactions.find();
	const allGateDetails = await GateDetails.find();

	res.status(200).json({
		success: true,
		data: gateDetails.length,
		allGateDetails: allGateDetails.length,
		allTxn: allTxn.length,
		allUnProssed: allGateDetails.length - allTxn.length,
	});
});

exports.getGrossWeight = asyncHandler(async (req, res, next) => {
	const grossWeight = await GrossTares.aggregate([
		{ $group: { _id: 0, gross_weight: { $sum: '$gross_wt' } } },
	]);

	res.status(200).json({
		success: true,
		data: grossWeight[0].gross_weight,
	});
});

exports.getTareWeight = asyncHandler(async (req, res, next) => {
	const tareWeight = await GrossTares.aggregate([
		{ $group: { _id: 0, tare_weight: { $sum: '$tare_wt' } } },
	]);

	res.status(200).json({
		success: true,
		data: tareWeight[0].tare_weight,
	});
});

exports.getTransactionStatus = asyncHandler(async (req, res, next) => {
	const gatedetails = await GateDetails.findOne({
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

	const debitnote = await DebitNotes.find(
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

	const pcr = await Pcrs.find(
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

	const grosstare = await GrossTares.findOne(
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

	const purchaseorder = await PurchaseOrderDetails.find(
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

	const scrapquality = await ScrapQualities.find(
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

exports.getAllGateDetails = asyncHandler(async (req, res, next) => {
	let from = new Date(req.params.gpdt);
	from.setHours(0, 0, 0, 0);
	let to = new Date(req.params.gpdt);
	to.setHours(23, 59, 59, 999);
	// const alldata = await GateDetails.find({
	// 	$and: [
	// 		{ gp_division: req.body.divn.toUpperCase() },
	// 		{ gate_pass_date: new Date(req.body.gpdt) },
	// 	],
	// });
	const alldata = await Transactions.aggregate([
		{
			$lookup: {
				from: 'GateDetails',
				localField: 'gate_pass_no',
				foreignField: 'gatePassNumber',
				as: 'GateDetailsData',
			},
		},
	]);

	res.status(200).json({ success: true, total: alldata.length, data: alldata });
});

exports.getToBeProccessed = asyncHandler(async (req, res, next) => {
	let from = new Date(req.params.gpdt);
	from.setHours(0, 0, 0, 0);
	let to = new Date(req.params.gpdt);
	to.setHours(23, 59, 59, 999);

	const gatedetails = await GateDetails.find({
		$and: [
			{ gp_division: req.params.divn.toLowerCase() },
			{ gate_pass_date: { $gte: from, $lte: to } },
		],
	}).sort('gate_pass_no');
	if (!gatedetails) {
		return next(new ErrorResponse(`No record found in GateDetails`, 204));
	}

	const totaldata = gatedetails.length;

	const division = await Division.findOne(
		{ unit: req.params.divn.toUpperCase() },
		{ _id: 1 }
	);
	if (!division) {
		return next(new ErrorResponse(`No record found In Divisions`, 204));
	}

	const transactions = await Transactions.find({
		$and: [
			{ division: division._id },
			{ gatePassDate: { $gte: from, $lte: to } },
		],
	});
	if (!transactions) {
		return next(new ErrorResponse(`No record found in Transactions`, 204));
	}

	let indexes = [];
	let toBeProccessed = [];
	await Promise.all(
		gatedetails.map(async (data, index) => {
			if (transactions.length === 0) {
				toBeProccessed.push(data);
			} else {
				await Promise.all(
					transactions.map(async (txndata) => {
						if (data.gate_pass_no === txndata.gatePassNumber) {
							indexes.push(index);
						}
					})
				);
			}
		})
	);

	indexes.reverse();
	indexes.forEach((index) => {
		gatedetails.splice(index, 1);
	});

	res.status(200).json({
		success: true,
		totalGateDetailsData: totaldata,
		totalDataToBeProccessed: gatedetails.length,
		message: `To Be Proccessed For Transactions`,
		transactions,
		data: gatedetails,
	});
});

exports.syncGateDetails = asyncHandler(async (req, res, next) => {
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';
	let errors = 0;
	let totalRecords = req.body.length;

	await Promise.all(
		req.body.map(async (gatedetail) => {
			const exists = await GateDetails.findOne({
				gate_pass_no: gatedetail.GP_NO,
			});

			try {
				if (exists) {
					skippedCount += 1;
				} else {
					await GateDetails.create({
						gp_division: gatedetail.GP_DIVN,
						gate_pass_no: gatedetail.GP_NO,
						gate_pass_date: gatedetail.GP_DT,
						truck_no: gatedetail.TRKNO,
						bill_no: gatedetail.BILLNO,
						bill_date: gatedetail.BILLDT,
						party_code: gatedetail.PARTY_CODE,
						party_name: gatedetail.PARTY_NM,
						purchase_order_no: gatedetail.PO_NO,
						indent_number: gatedetail.INDENT_NO,
						gate_pass_icdp: gatedetail.GP_ICDP,
						itnm: gatedetail.ITNM,
						gate_pass_qty: gatedetail.GP_QTY,
					});
					addedCount += 1;
					logType = 'info';
				}
			} catch (err) {
				errors += 1;
			}
		})
	);

	logType = logType || 'warning';
	message = `Gate Details - Total Records: ${totalRecords}, Added: ${addedCount}, Skipped: ${skippedCount}, Errors: ${errors}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message,
	});
});

exports.syncDebitNote = asyncHandler(async (req, res, next) => {
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';
	let errors = 0;
	let totalRecords = req.body.length;

	await Promise.all(
		req.body.map(async (debitNote) => {
			const exists = await DebitNotes.findOne({
				gate_pass_no: debitNote.GP_NO,
			});

			try {
				if (exists) {
					skippedCount += 1;
				} else {
					await DebitNotes.create({
						division: debitNote.DIVN,
						type: debitNote.TY,
						id: debitNote.ID,
						idt: debitNote.IDT,
						adv_no: debitNote.ADV_NO,
						purchase_order_no: debitNote.PO_NO,
						purchase_receipt_no: debitNote.PR_NO,
						gate_pass_no: debitNote.GP_NO,
						gate_pass_date: debitNote.GP_DT,
						truck_no: debitNote.TRKNO,
						category_name: debitNote.CATEGORY_NM,
						catg_name: debitNote.CATG_NM,
						qty: debitNote.QTY,
						rate: debitNote.RATE,
						val: debitNote.VAL,
					});
					addedCount += 1;
					logType = 'info';
				}
			} catch (err) {
				errors += 1;
			}
		})
	);

	logType = logType || 'warning';
	message = `DebitNote - TotalRecords: ${totalRecords}, Added: ${addedCount}, Skipped: ${skippedCount}, Errors: ${errors}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message,
	});
});

exports.syncPcr = asyncHandler(async (req, res, next) => {
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';
	let errors = 0;
	let totalRecords = req.body.length;

	await Promise.all(
		req.body.map(async (pcr) => {
			const exists = await Pcrs.findOne({ gate_pass_no: pcr.GP_NO });

			try {
				if (exists) {
					skippedCount += 1;
				} else {
					await Pcrs.create({
						division: pcr.DIVN,
						type: pcr.TY,
						id: pcr.ID,
						idt: pcr.IDT,
						purchase_order_no: pcr.PO_NO,
						purchase_recipt_no: pcr.PR_NO,
						gate_pass_no: pcr.GP_NO,
						truck_no: pcr.TRKNO,
						icdp: pcr.ICDP,
						itnm: pcr.ITNM,
						qty: pcr.QTY,
						rate: pcr.RATE,
						upgst_amt: pcr.UPGST_AMT,
						cgst_amt: pcr.CGST_AMT,
						igst_amt: pcr.IGST_AMT,
						val: pcr.VAL,
					});
					addedCount += 1;
					logType = 'info';
				}
			} catch (err) {
				errors += 1;
			}
		})
	);

	logType = logType || 'warning';
	message = `Pcr - Total Records: ${totalRecords}, Added: ${addedCount}, Skipped: ${skippedCount}, Errors: ${errors}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message,
	});
});

exports.syncGrossTare = asyncHandler(async (req, res, next) => {
	let updatedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';
	let errors = 0;
	let totalRecords = req.body.length;

	await Promise.all(
		req.body.map(async (grosstare) => {
			const exists = await GrossTares.findOne({
				gate_pass_no: grosstare.GP_NO,
			});

			try {
				if (exists) {
					await GrossTares.findOneAndUpdate(
						{
							gate_pass_no: grosstare.GP_NO,
						},
						{ gross_wt: grosstare.GROSS_WT, tare_wt: grosstare.TARE_WT },
						{ new: true, runValidators: true }
					);
					updatedCount += 1;
				} else {
					await GrossTares.create({
						gp_division: grosstare.GP_DIVN,
						gate_pass_no: grosstare.GP_NO,
						truck_no: grosstare.TRKNO,
						token_id: grosstare.TOKEN_ID,
						gate_pass_date: grosstare.GP_DT,
						gross_wt: grosstare.GROSS_WT,
						tare_wt: grosstare.TARE_WT,
					});
					addedCount += 1;
				}
			} catch (err) {
				errors += 1;
			}
		})
	);

	logType = logType || 'warning';
	message = `GrossTare - Total Records: ${totalRecords}, Added: ${addedCount}, Updated: ${updatedCount}, Errors: ${errors}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message: `GrossTare - Total Records: ${totalRecords}, Added: ${addedCount}, Updated: ${updatedCount}, Errors: ${errors}`,
	});
});

exports.syncPODetails = asyncHandler(async (req, res, next) => {
	let updatedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';
	let errors = 0;
	let totalRecords = req.body.length;

	await Promise.all(
		req.body.map(async (purchasedetail) => {
			const exists = await PurchaseOrderDetails.findOne({
				gate_pass_no: purchasedetail.GP_NO,
			});

			try {
				if (exists) {
					await PurchaseOrderDetails.findOneAndUpdate(
						{ gate_pass_no: purchasedetail.GP_NO },
						{ rec_qty: purchasedetail.REC_QTY },
						{ new: true, runValidators: true }
					);
					updatedCount += 1;
				} else {
					await PurchaseOrderDetails.create({
						divisions: purchasedetail.DIVN,
						order_no: purchasedetail.PO_NO,
						order_date: purchasedetail.PO_DT,
						pr_cno: purchasedetail.PR_CNO,
						category_name: purchasedetail.CATEGORY_NM,
						gate_pass_no: purchasedetail.GP_NO,
						rate: purchasedetail.RATE,
						qty: purchasedetail.PO_QTY,
						rec_qty: purchasedetail.REC_QTY,
					});
					addedCount += 1;
					logType = 'info';
				}
			} catch (err) {
				errors += 1;
			}
		})
	);

	logType = logType || 'warning';
	message = `Purchase Order - Total Records: ${totalRecords}, Added: ${addedCount}, Updated: ${updatedCount}, Errors: ${errors}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message: `Purchase Order - Total Records: ${totalRecords}, Added: ${addedCount}, Updated: ${updatedCount}, Errors: ${errors}`,
	});
});

exports.syncScrapQuality = asyncHandler(async (req, res, next) => {
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';
	let errors = 0;
	let totalRecords = req.body.length;

	await Promise.all(
		req.body.map(async (scrapquality) => {
			try {
				const exists = await ScrapQualities.findOne({
					gate_pass_no: scrapquality.GP_NO,
				});

				if (exists) {
					skippedCount += 1;
				} else {
					await ScrapQualities.create({
						division: scrapquality.DIVN,
						divisionId: scrapquality.ID,
						date: scrapquality.DT,
						gate_pass_no: scrapquality.GP_NO,
						gate_pass_date: scrapquality.GP_DT,
						truck_no: scrapquality.TRKNO,
						item_category: scrapquality.ITM_CATG,
						category_name: scrapquality.CATG_NM,
						weight: scrapquality.WT,
						per: scrapquality.PER,
					});
					addedCount += 1;
					logType = 'info';
				}
			} catch (err) {
				errors += 1;
			}
		})
	);

	logType = logType || 'warning';
	let method = req.url || req.path;
	method = method.slice(1);
	message = `Scrap Quality - Total Records: ${totalRecords}, Added: ${addedCount}, Skipped: ${skippedCount}, Errors: ${errors}`;
	const data = {
		logType,
		method,
		message,
		user: req.user._id,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message,
	});
});
