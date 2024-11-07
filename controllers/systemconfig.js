const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const SystemConfig = require('../models/SystemConfig');
const crypto = require('crypto');

// @desc    Get System Configuration Details
// @routes  GET /api/v1/systemconfig
// @access  Private
exports.getSystemCongif = asyncHandler(async (req, res, next) => {
	const systemconfig = await SystemConfig.find();

	if (!systemconfig) {
		return next(new ErrorResponse(`System Configuration Not Available`, 202));
	}

	return res.status(200).json({
		success: true,
		message: `System Configuration`,
		data: systemconfig,
	});
});

// @desc    Create System Configuration Details
// @routes  POST /api/v1/systemconfig
// @access  Private
exports.createSystemConfig = asyncHandler(async (req, res, next) => {
	const systemId = req.body.systemId;
	const password = req.body.password;
	const systemIp = req.body.systemIp;

	const systemconfig = await SystemConfig.create({
		systemId,
		password,
		systemIp,
	});

	if (!systemconfig) {
		return next(new ErrorResponse(`Unable to Create Configuration`, 204));
	}

	return res.status(201).json({
		success: true,
		message: `Configuration Set Successfull`,
		data: systemconfig,
	});
});

// @desc    Connect System
// @routes  POST /api/v1/systemconfig/connect
// @access  Private
exports.connectSystem = asyncHandler(async (req, res, next) => {
	const systemId = req.body.systemId;
	const password = req.body.password;
	const systemIp = req.body.systemIp;

	if (!systemId || !systemIp || !password) {
		return next(
			new ErrorResponse(
				`Please add ${systemId ? '' : 'System ID'} ${
					systemIp ? '' : 'System Ip'
				} ${password ? '' : 'Password'}`,
				202
			)
		);
	}

	const systemconfig = await SystemConfig.findOne({ systemId, systemIp });

	if (!systemconfig) {
		return next(new ErrorResponse(`System ID & IP not metch`, 202));
	}

	const passwordMetched = await systemconfig.metchPassword(password);

	if (!passwordMetched) {
		return next(new ErrorResponse(`Incorect Password `, 202));
	}

	const randombytes = crypto.randomBytes(10);
	const secret = 'ajs$jksd12';

	return res.status(200).json({
		success: true,
		setting: {
			port: 88099,
			timeinterval: 20,
		},
	});
});
