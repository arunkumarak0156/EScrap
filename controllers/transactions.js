const imageThumbnail = require('image-thumbnail');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Transactions = require('../models/Transactions');
const Division = require('../models/Divison');
const Type = require('../models/Type');
const SubType = require('../models/SubType');
const Images = require('../models/Images');
const Thumbnails = require('../models/Thumbnails');
const { log } = require('./logger');
const { v4: uuidv4 } = require('uuid');

// @decs        Get All Transactions Count and last 24 hours transaction count
// @routes      GET /api/v1/transaction/getstatus
// @access      Private
exports.getAllLastTransactionStatus = asyncHandler(async (req, res, next) => {
	let now = new Date();
	now.setHours(now.getHours() - 24);
	const lastTransactions = await Transactions.find({
		createdAt: { $gte: now },
	});
	const allTransactions = await Transactions.find();

	res.status(200).json({
		success: true,
		message: `Last 24 hours by all transactions`,
		lastTransaction: lastTransactions.length,
		allTransaction: allTransactions.length,
	});
});

// @decs        Get All Transactions without any transaction image
// @routes      GET /api/v1/transaction
// @access      Private
exports.getAllTransactions = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// @decs        Get Single Transaction By Id
// @routes      GET /api/v1/transaction/details/:id
// @access      Private
exports.getTransactionById = asyncHandler(async (req, res, next) => {
	const transaction = await Transactions.findOne(
		{
			_id: req.params.id,
		},
		{ createdAt: 0 }
	);

	if (!transaction) {
		return next(new ErrorResponse(`No Transaction Details`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Detail`,
		data: transaction,
	});
});

exports.getTransactionDivisionId = asyncHandler(async (req, res, next) => {
	let from = new Date(req.body.gatePassDate);
	let to = new Date(req.body.gatePassDate);
	to.setHours(23, 59, 59, 999);
	const transaction = await Transactions.findOne(
		{
			$and: [
				{ division: req.params.divn },
				{
					gatePassDate: {
						$gte: from,
						$lte: to,
					},
				},
			],
		},
		{ createdAt: 0 }
	);

	if (!transaction) {
		return next(new ErrorResponse(`No Transaction Details`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Detail By Division Id`,
		data: transaction,
	});
});

// @decs        Get Single Transaction By GatePassNo
// @routes      GET /api/v1/transaction/erprefno
// @access      Private
exports.getTransactionByGatePassNumber = asyncHandler(
	async (req, res, next) => {
		const transaction = await Transactions.findOne(
			{
				gatePassNumber: req.params.gpno,
			},
			{ createdAt: 0 }
		);

		if (!transaction) {
			return next(new ErrorResponse(`No Transaction Details`, 204));
		}

		return res.status(200).json({
			success: true,
			message: `Transaction Detail`,
			data: transaction,
		});
	}
);

// @decs        Get Transaction By Date
// @routes      GET /api/v1/transaction/searchbydate/:from/:to
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
// @routes      GET /api/v1/transaction/searchby/:search
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

// @decs        Get transaction thumbnails
// @routes      GET /api/v1/transactiondetails/:id/thumbnail
// @access      Private
exports.getTransactionThumbnail = asyncHandler(async (req, res, next) => {
	const thumbnail = await Thumbnails.find(
		{
			transactionId: req.params.id,
		},
		{ _id: 0, createdAt: 0 }
	);

	if (!thumbnail) {
		return next(new ErrorResponse(`No Transaction Details`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `Thumbnails`,
		thumbnail,
	});
});

// @decs        Get transaction image
// @routes      GET /api/v1/transactiondetails/:id/image
// @access      Private
exports.getTransactionImage = asyncHandler(async (req, res, next) => {
	const image = await Images.findOne(
		{
			imageId: req.params.id,
		},
		{ _id: 0, createdAt: 0 }
	);

	if (!image) {
		return next(new ErrorResponse(`No Image`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `Image`,
		image,
	});
});

// @decs        Create Transactions
// @routes      POST /api/v1/transaction
// @access      Private
exports.createTransaction = asyncHandler(async (req, res, next) => {
	const txnData = {
		division: req.body.division,
		type: req.body.type,
		subType: req.body.subType,
		vehicleNo: req.body.vehicleNo,
		gateInOut: req.body.gateInOut,
		partyName: req.body.partyName,
		partyCode: req.body.partyCode,
		gatePassNumber: req.body.gatePassNumber,
		gatePassDate: req.body.gatePassDate,
		entryDate: req.body.entryDate,
		remark: req.body.remark,
		userId: req.user._id,
	};

	const division = await Division.findById({
		_id: txnData.division,
	});

	if (!division) {
		return next(new ErrorResponse(`Invalid Divisision `, 204));
	}

	const type = await Type.findById({
		_id: txnData.type,
	});

	if (!type) {
		return next(new ErrorResponse(`Invalid Type `, 204));
	}

	const subType = await SubType.findById({
		_id: txnData.subType,
	});

	if (!subType) {
		return next(new ErrorResponse(`Invalid Sub Type `, 204));
	}

	const transaction = await Transactions.create(txnData);

	const options = { percentage: 10, responseType: 'base64' };
	req.body.images.forEach(async (img, index) => {
		let uuid = uuidv4();
		let imageData = {
			transactionId: transaction._id,
			imageId: uuid,
			captureTime: img.captureTime,
			imageName: 'image' + ++index,
			image: img.base64,
		};
		let thumbnailImage = await imageThumbnail(img.base64, options);
		let thumbnailData = {
			transactionId: transaction._id,
			imageId: uuid,
			captureTime: img.captureTime,
			thumbnailName: 'image' + index,
			thumbnail: thumbnailImage,
		};

		const image = await Images.create(imageData);
		const thumbnail = await Thumbnails.create(thumbnailData);
	});

	if (!transaction) {
		return next(new ErrorResponse(`Unable to create Transaction`, 202));
	}

	if (transaction) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Transaction Created Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(201).json({
		success: true,
		message: `Transaction Created`,
		data: transaction,
	});
});

// @decs        Update Transactions
// @routes      PUT /api/v1/transaction/:id
// @access      Private
exports.updateTransaction = asyncHandler(async (req, res, next) => {
	const txnData = {
		division: req.body.division,
		type: req.body.type,
		subType: req.body.subType,
		vehicleNo: req.body.vehicleNo,
		gateInOut: req.body.gateInOut,
		partyName: req.body.partyName,
		partyCode: req.body.partyCode,
		gatePassNumber: req.body.gatePassNumber,
		gatePassDate: req.body.gatePassDate,
		entryDate: req.body.entryDate,
		remark: req.body.remark,
	};

	const division = await Division.findById({
		_id: txnData.division,
	});

	if (!division) {
		return next(new ErrorResponse(`Invalid Divisision `, 204));
	}

	const type = await Type.findById({
		_id: txnData.type,
	});

	if (!type) {
		return next(new ErrorResponse(`Invalid Type `, 204));
	}

	const subType = await SubType.findById({
		_id: txnData.subType,
	});

	if (!subType) {
		return next(new ErrorResponse(`Invalid Sub Type `, 204));
	}

	const dbImageData = await Images.find(
		{ transactionId: req.params.txnid },
		{ imageId: 1, _id: 0 }
	);

	const dbImageId = [];
	dbImageData.forEach((data) => {
		dbImageId.push(data.imageId);
	});

	const reqImageId = [];
	req.body.images.forEach(async (imgData, index) => {
		reqImageId.push(imgData.imageId);
	});

	let differenceId = dbImageId.filter((x) => !reqImageId.includes(x));

	differenceId.forEach(async (id) => {
		await Thumbnails.findOneAndDelete({ imageId: id });
		await Images.findOneAndDelete({ imageId: id });
	});

	const options = { percentage: 10, responseType: 'base64' };
	req.body.images.forEach(async (img, index) => {
		if (!img.imageId) {
			let uuid = uuidv4();
			let imageData = {
				transactionId: req.params.id,
				imageId: uuid,
				captureTime: img.captureTime,
				imageName: 'image' + ++index,
				image: img.base64,
			};
			let thumbnailImage = await imageThumbnail(img.base64, options);
			let thumbnailData = {
				transactionId: req.params.txnid,
				imageId: uuid,
				captureTime: img.captureTime,
				thumbnailName: 'image' + index,
				thumbnail: thumbnailImage,
			};

			const image = await Images.create(imageData);
			const thumbnail = await Thumbnails.create(thumbnailData);
		}
	});

	const transaction = await Transactions.findOneAndUpdate(
		{ _id: req.params.txnid },
		txnData,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!transaction) {
		return next(new ErrorResponse(`Unable to Update Transaction`, 202));
	}

	if (transaction) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Transaction Updated Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Updated`,
		data: transaction,
	});
});

// @decs        Update Transactions Image
// @routes      POST /api/v1/transaction/update/:id/image
// @access      Private
exports.updateTransactionImage = asyncHandler(async (req, res, next) => {
	if (!req.body.imageId) {
		return next(new ErrorResponse(`Please add image id`, 204));
	}
	const options = { percentage: 10, responseType: 'base64' };

	let imageData = {
		image: req.body.images[0].base64,
	};
	let thumbnailImage = await imageThumbnail(req.body.images[0].base64, options);
	let thumbnailData = {
		thumbnail: thumbnailImage,
	};

	const image = await Images.findOneAndUpdate(
		{ imageId: req.body.imageId },
		imageData,
		{ new: true, runValidators: true }
	);
	const thumbnail = await Thumbnails.findOneAndUpdate(
		{ imageId: req.body.imageId },
		thumbnailData,
		{ new: true, runValidators: true }
	);

	return res.status(200).json({
		success: true,
		message: `Transaction Image Updated`,
		thumbnail,
	});
});

// @decs        Delete Transactions
// @routes      PUT /api/v1/transaction/delete/:id/transaction
// @access      Private
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
	const transaction = await Transactions.findById({
		_id: req.params.id,
	});

	if (!transaction) {
		return next(new ErrorResponse(`Unable to Find Transaction`, 202));
	}

	await transaction.remove();

	if (transaction) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Transaction Deleted Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Deleted`,
		data: {},
	});
});

// @decs        Delete Transactions Image
// @routes      DELETE /api/v1/transaction/delete/:id/image
// @access      Private
exports.deleteTransactionImage = asyncHandler(async (req, res, next) => {
	let image = await Images.findOne({ imageId: req.params.id });
	if (!image) {
		return next(new ErrorResponse(`No Image Record Found`, 204));
	}
	const { images, thumbnails } = await Transactions.findOne(
		{ images: image._id },
		{ images: 1, thumbnails: 1 }
	);

	images.forEach((id, index) => {
		if (id.toString() === image._id.toString()) {
			images.splice(index, 1);
			thumbnails.splice(index, 1);
		}
	});
	await Transactions.findByIdAndUpdate(
		{ _id: image.transactionId },
		{ images, thumbnails },
		{ new: true, runValidators: true }
	);
	await Thumbnails.findOneAndDelete({ imageId: req.params.id });
	await Images.findOneAndDelete({ imageId: req.params.id });

	return res.status(200).json({
		success: true,
		message: `Transaction Image Deleted`,
		data: {},
	});
});

// @decs        Delete Transactions Image
// @routes      DELETE /api/v1/transaction/delete/:id/thumbnail
// @access      Private
exports.deleteTransactionImageByThumbnail = asyncHandler(
	async (req, res, next) => {
		let thumbnail = await Thumbnails.findOne({ imageId: req.params.id });
		if (!thumbnail) {
			return next(new ErrorResponse(`No Thumbnail Record Found`, 204));
		}
		const { images, thumbnails } = await Transactions.findOne(
			{ thumbnails: thumbnail._id },
			{ images: 1, thumbnails: 1 }
		);

		thumbnails.forEach((id, index) => {
			if (id.toString() === thumbnail._id.toString()) {
				images.splice(index, 1);
				thumbnails.splice(index, 1);
			}
		});
		await Transactions.findByIdAndUpdate(
			{ _id: thumbnail.transactionId },
			{ images, thumbnails },
			{ new: true, runValidators: true }
		);
		await Thumbnails.findOneAndDelete({ imageId: req.params.id });
		await Images.findOneAndDelete({ imageId: req.params.id });

		return res.status(200).json({
			success: true,
			message: `Transaction Image Deleted`,
			data: {},
		});
	}
);
