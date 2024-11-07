const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/Users');
const UserActivity = require('../models/UserActivity');
const Sniffr = require('sniffr');
const Users = require('../models/Users');
const { log } = require('./logger');

// @decs        Register User
// @routes      POST /api/v1/auth/register
// @access      Private
exports.register = asyncHandler(async (req, res, next) => {
	const user = await User.create(req.body);

	if (!user) {
		return next(new ErrorResponse(`Unable to Register New User`, 204));
	}

	res.status(201).json({
		success: true,
		message: 'User Registered',
		data: user,
	});
});

// @decs        Login User
// @routes      POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
	const { userName, password } = req.body;

	if (!userName || !password) {
		return next(new ErrorResponse(`Please add Uase Name and password`, 202));
	}

	let user = await User.findOne({ userName, active: true }).select('+password');

	if (!user) {
		// return next(new ErrorResponse(`Invalid User name & password`, 404));
		res
			.status(202)
			.json({ success: false, message: 'Invalid User name & Password' });
	}

	const passwordMetched = await user.metchPassword(password);

	if (!passwordMetched) {
		// return next(new ErrorResponse(`Invalid user name & password`, 404));
		res
			.status(202)
			.json({ success: false, message: 'Invalid User name & Password' });
	}

	const userId = user._id;
	const name = user.userName;

	const loginExpireTime = new Date(Date.now() + 4 * 60 * 60 * 1000);

	// const userActivity = await UserActivity.create({
	// 	userId: userId,
	// 	userName: name,
	// });

	// await User.findByIdAndUpdate(
	// 	user._id,
	// 	{ activityId: userActivity._id, loginExpire: loginExpireTime },
	// 	{ new: true, runValidators: true }
	// );

	// user = await User.findById(user._id).populate('deviceses');

	// let deviceid = false;

	// await user.deviceses.map((device) => {
	// 	if (
	// 		device.deviceId === (req.body.ipv4 || '11111') &&
	// 		device.osType === (req.body.osType || 'windows')
	// 	) {
	// 		deviceid = true;
	// 	} else if (
	// 		device.deviceId === (req.body.imei || '11111') &&
	// 		device.osType === (req.body.osType || 'android')
	// 	) {
	// 		deviceid = true;
	// 	}
	// });

	// if (!deviceid) {
	// 	return next(new ErrorResponse(`Device not Registered`, 204));
	// }

	user = await Users.findById(user._id, {
		active: 0,
		deviceses: 0,
		createdAt: 0,
		activityId: 0,
	});

	sendTokenResponse(user, 200, res, req);
});

// @decs        Logout User
// @routes      GET /api/v1/auth/logout
// @access      Private
exports.logout = asyncHandler(async (req, res, next) => {
	const logedOut = new Date(Date.now());

	const activityId = req.user.activityId;
	await UserActivity.findByIdAndUpdate(
		activityId,
		{ logedOut },
		{
			new: true,
			runValidators: true,
		}
	);

	await User.findByIdAndUpdate(
		req.user._id,
		{ activityId: null },
		{
			new: true,
			runValidators: true,
		}
	);

	res
		.status(200)
		.cookie('token', 'none', { expires: new Date(Date.now()), httpOnly: true })
		.json({
			success: true,
			message: `Logout Success`,
			data: `Loged Out`,
		});
});

// @decs        Get Logedin User
// @routes      GET /api/v1/auth/user
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const loginExpire = req.user.loginExpire - Date.now();

	return res.status(200).json({
		success: true,
		message: `User Data Available`,
		loginExpire,
		data: req.user,
	});
});

// @decs        Update User
// @routes      PUT /api/v1/auth/update
// @access      Private
exports.updateUser = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		userName: req.body.userName,
		mobileNo: req.body.mobileNo,
	};
	const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	if (!user) {
		return next(new ErrorResponse(`Unable to Update `, 202));
	}

	if (user) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Update Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: `User Record Updated`,
		data: user,
	});
});

// @decs        Delete User
// @routes      DELETE /api/v1/auth/update
// @access      Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.user._id);

	if (!user) {
		return next(new ErrorResponse(`Unable to delete User`, 204));
	}

	if (user) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Delete Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: `User Record Deleted`,
		data: `User Id ${req.user._id} deleted`,
	});
});

// @decs        Update Logedid User Password
// @routes      PUT /api/v1/auth/updatepassword
// @access      Private
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
	if (req.body.newPassword !== req.body.confirmPassword) {
		return next(
			new ErrorResponse(`Please metch New Password & Confirm Password`, 204)
		);
	}

	const user = await User.findById(req.user._id).select('+password');

	if (!req.body.currentPassword) {
		return next(new ErrorResponse(`Please add Current Password`, 204));
	}

	if (!(await user.metchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse(`Current Password is Incorrect`, 202));
	}

	if (!req.body.newPassword) {
		return next(new ErrorResponse(`Please add New Password`, 202));
	}

	user.password = req.body.newPassword;
	await user.save();

	if (!user) {
		return next(new ErrorResponse(`Unable to Update Password `, 204));
	}

	if (user) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Password Update Successful',
			user: req.user._id,
		};
		log(data);
	}

	sendTokenResponse(user, 200, res, req);
});

const sendTokenResponse = async (user, statusCode, res, req) => {
	const token = await user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	const loginExpire = user.loginExpire - Date.now();
	return res.status(statusCode).cookie('token', token, options).json({
		success: true,
		message: `Login Success`,
		role: user.role,
		loginExpire,
		user: user,
		token,
	});
};
