const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/Users');

exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(new ErrorResponse(`User not Authorized`, 203));
	}

	try {
		const decodedId = await jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.findById(decodedId.id).populate('deviceses');
		next();
	} catch (err) {
		return next(new ErrorResponse(`Your token is Expired`, 202));
	}
});

exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`${req.user.role} type of User is not Authorize to access this service`,
					203
				)
			);
		}
		next();
	};
};
