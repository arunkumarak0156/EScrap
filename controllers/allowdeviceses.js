const AllowDeviceses = require('../models/AllowDeviceses');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @decs        Get Deviceses
// @routes      GET /api/v1/device/devicecount
// @access      Private
exports.getDevicesesCount = asyncHandler(async (req, res, next) => {
	const device = await AllowDeviceses.find();

	if (!device) {
		return next(new ErrorResponse(`No Device details`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `All Deviceses Count`,
		total: device.length,
	});
});

// @decs        Get Deviceses
// @routes      GET /api/v1/device
// @access      Private
exports.getDeviceses = asyncHandler(async (req, res, next) => {
	const device = await AllowDeviceses.find().populate('userId');

	if (!device) {
		return next(new ErrorResponse(`No Device details`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `All Deviceses`,
		total: device.length,
		data: device,
	});
});

// @decs        Get Device
// @routes      GET /api/v1/device/:id
// @access      Private
exports.getDevice = asyncHandler(async (req, res, next) => {
	const device = await AllowDeviceses.findById(req.params.id).populate(
		'userId'
	);

	if (!device) {
		return next(new ErrorResponse(`No Device details`, 204));
	}

	return res.status(200).json({
		success: true,
		message: `Deviceses Details`,
		total: device.length,
		data: device,
	});
});

// @decs        Register Device
// @routes      POST /api/v1/device
// @access      Private
exports.registerDevice = asyncHandler(async (req, res, next) => {
	let validity = new Date();
	const month = req.body.validity || 24;
	validity.setMonth(validity.getMonth() + month);
	req.body.validity = validity;

	const device = await AllowDeviceses.create(req.body);

	if (!device) {
		return next(new ErrorResponse(`No Device details`, 203));
	}

	return res.status(201).json({
		success: true,
		message: `Device Registered`,
		data: device,
	});
});

// @decs        Update Device
// @routes      PUT /api/v1/device/:id
// @access      Private
exports.updateDevice = asyncHandler(async (req, res, next) => {
	let validity = new Date();
	const month = req.body.validity;
	validity.setMonth(validity.getMonth() + month);
	req.body.validity ? (req.body.validity = validity) : req.body;

	const device = await AllowDeviceses.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!device) {
		return next(new ErrorResponse(`No Device details`, 204));
	}

	return res.status(202).json({
		success: true,
		message: `Device Registered`,
		data: device,
	});
});

// @decs        Delete Device
// @routes      DELETE /api/v1/device/:id
// @access      Private
exports.deleteDevice = asyncHandler(async (req, res, next) => {
	const device = await AllowDeviceses.findByIdAndUpdate(
		req.params.id,
		{ active: false },
		{
			new: true,
			runValidators: true,
		}
	);

	if (!device) {
		return next(new ErrorResponse(`No Device details`, 204));
	}

	return res.status(202).json({
		success: true,
		message: `Device Registered`,
		data: device,
	});
});
