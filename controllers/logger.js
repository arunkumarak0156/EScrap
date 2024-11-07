const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Logger = require('../models/Logger');

// @desc    Get All last 24 hours Log Data
// @routes  GET /api/v1/log/getalllog
// @access  Private
exports.getAllLogs = asyncHandler(async (req, res, next) => {
	const date = new Date();
	date.setHours(date.getHours() - 24);
	const logs = await Logger.find({
		createdAt: { $gte: date },
	}).sort('-createdAt');

	return res.status(200).json({
		success: true,
		message: 'All Logs data',
		total: logs.length,
		data: logs,
	});
});

// @desc    Create Log
// @access  Private
exports.log = asyncHandler(async (data) => {
	const logger = await Logger.create(data);
});
