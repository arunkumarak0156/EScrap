const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Setting = require('../models/Setting');

// @desc    Get Server Settings
// @routes  GET /api/v1/setting
// @access  Private
exports.getSetting = asyncHandler(async (req, es, next) => {
	const setting = await Setting.find();

	if (!setting) {
		return next(new ErrorResponse(`No Setting Data Available`, 400));
	}

	return res.status(200).json({
		success: true,
		message: `Setting Data`,
		data: setting,
	});
});

// @desc    Create Server Settings
// @routes  POST /api/v1/setting
// @access  Private
exports.createSetting = asyncHandler(async (req, es, next) => {
	const setting = await Setting.create(req.body);

	if (!setting) {
		return next(new ErrorResponse(`Unable to Create Server Setting`, 400));
	}

	return res.status(201).json({
		success: true,
		message: `Server data created`,
		data: setting,
	});
});

// @desc    Update Server Settings
// @routes  PUT /api/v1/setting
// @access  Private
exports.updateSetting = asyncHandler(async (req, es, next) => {
	const setting = await Setting.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!setting) {
		return next(new ErrorResponse(`Unable to Create Server Setting`, 400));
	}

	return res.status(201).json({
		success: true,
		message: `Server data created`,
		data: setting,
	});
});
