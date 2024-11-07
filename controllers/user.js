const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/Users');
const { log } = require('./logger');

// @decs        Get total users count 
// @routes      GET /api/v1/user/usercount
// @access      Privet
exports.getUsersCount = asyncHandler(async (req, res, next) => {
	const users = await User.find();
	if (!users) {
		return next(new ErrorResponse(`No Data found`, 204));
	}
	res.status(200).json({
		success: true,
        message: 'Total number of users',
		total: users.length,
	});
});

// @decs        Get all users
// @routes      GET /api/v1/user
// @access      Privet
exports.getUsers = asyncHandler(async (req, res, next) => {
	const users = await User.find().populate('deviceses');
	if (!users) {
		return next(new ErrorResponse(`No Data found`, 204));
	}
	res.status(200).json({
		success: true,
		total: users.length,
		data: users,
	});
});

// @decs        Get Single user
// @routes      GET /api/v1/user/:id
// @access      Privet
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ _id: req.params.id }).populate('deviceses');
	if (!user) {
		return next(new ErrorResponse(`User not found`, 204));
	}
	res.status(200).json({
		success: true,
		data: user,
	});
});

// @decs        Create user
// @routes      POST /api/v1/user
// @access      Public
exports.createUser = asyncHandler(async (req, res, next) => {
	if (!req.body) {
		return next(new ErrorResponse(`Please add required fields`, 204));
	}

	const user = await User.create(req.body);

	if (!user) {
		return next(new ErrorResponse(`Unable to Register `, 204));
	}

	if (user) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Registration Successful',
			user: req.user._id,
		};
		log(data);
	}

	res.status(201).json({
		success: true,
		message: 'User Registered',
		data: user,
	});
});

// @decs        Update Single user
// @routes      PUT /api/v1/user/:id
// @access      Privet
exports.updateUser = asyncHandler(async (req, res, next) => {
	if (!req.body) {
		return next(new ErrorResponse(`Please add updatable data`, 204));
	}

	const fieldsToUpdate = {
		name: req.body.name,
		userName: req.body.userName,
		email: req.body.email,
		mobileNo: req.body.mobileNo,
		role: req.body.role,
	};

	const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	if (!user) {
		return next(new ErrorResponse(`Unable to Update User Details`, 204));
	}

	if (user) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'User Details Updated Successful',
			user: req.user._id,
		};
		log(data);
	}

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @decs        Update Password
// @routes      PUT /api/v1/user/updatepassword/:id
// @access      Privet
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
	if (!req.body.newPassword) {
		return next(new ErrorResponse(`Please add New Password`, 204));
	}

	if (req.body.newPassword !== req.body.confirmPassword) {
		return next(
			new ErrorResponse(`Please metch New Password & Confirm Password`, 204)
		);
	}

	const user = await User.findById(req.params.id);

	user.password = req.body.newPassword;
	await user.save();

	if (!user) {
		return next(new ErrorResponse(`Unable to Update Password`, 204));
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

	res.status(200).json({
		success: true,
		message: 'Password Updated Successfully',
		data: user,
	});
});

// @decs        Update Password
// @routes      PUT /api/v1/user/updatepassword/:id
// @access      Privet
exports.updateUserRole = asyncHandler(async (req, res, next) => {
	if (!req.body.role) {
		return next(new ErrorResponse(`Please add User Role`, 204));
	}

	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ role: req.body.role },
		{
			new: true,
			runValidators: true,
		}
	);

	if (!user) {
		return next(new ErrorResponse(`Unable to Update Role`, 204));
	}

	if (user) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'User Role Updateed Successful',
			user: req.user._id,
		};
		log(data);
	}

	res.status(200).json({
		success: true,
		message: 'User Role Updated Successfully',
		data: user,
	});
});

// @decs        Active Inactive User
// @routes      PUT /api/v1/user/useractivation/:id
// @access      Privet
exports.userActivation = asyncHandler(async (req, res, next) => {
	if (!req.body.active) {
		return next(new ErrorResponse(`Please add User Active Type`, 204));
	}

	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ active: req.body.active },
		{
			new: true,
			runValidators: true,
		}
	);

	res.status(200).json({
		success: true,
		message: 'User Role Updated Successfully',
		data: user,
	});
});

// @decs        Delete Single user
// @routes      DELETE /api/v1/user/:id
// @access      Privet
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndDelete({ _id: req.params.id });

	if (!user) {
		return next(new ErrorResponse(`Unable to Delete User `, 204));
	}

	if (user) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'User Deleted Successful',
			user: req.user._id,
		};
		log(data);
	}

	res.status(200).json({
		success: true,
		data: `User Profile Deleted`,
	});
});
