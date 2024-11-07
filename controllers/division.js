const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Division = require('../models/Divison');
const { log } = require('./logger');

// @desc    Get All Divisions data
// @routes  GET /api/v1/division
// @access  Private
exports.getAllDivisions = asyncHandler(async (req, res, next) => {
	const divisions = await Division.find({ active: true });

	if (!divisions) {
		return next(new ErrorResponse(`Division Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'All Division data',
		total: divisions.length,
		data: divisions,
	});
});

// @desc    Get Division Details By Id
// @routes  GET /api/v1/division/details/:id
// @access  Private
exports.getDivisionById = asyncHandler(async (req, res, next) => {
	const division = await Division.findById({
		_id: req.params.id,
		active: true,
	});

	if (!division) {
		return next(new ErrorResponse(`Division Details Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'Division Details',
		data: division,
	});
});

// @desc    Create Division
// @routes  POST /api/v1/division/create
// @access  Private
exports.createDivision = asyncHandler(async (req, res, next) => {
	req.body.userId = req.user._id;
	const divisionData = await Division.findOne({
		$and: [
			{ divisionName: req.body.divisionName },
			{ division: req.body.division },
		],
	});

	if (divisionData) {
		return next(new ErrorResponse(`Division Allready Exist`, 204));
	}

	const division = await Division.create(req.body);

	if (!division) {
		return next(new ErrorResponse(`Division Not Created`, 202));
	}

	if (division) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Division Created Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(201).json({
		success: true,
		message: 'Division data Created',
		data: division,
	});
});

// @desc    Update Division Data
// @routes  PUT /api/v1/division/update/:id
// @access  Private
exports.updateDivision = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		division: req.body.division,
		divisionName: req.body.divisionName,
		city: req.body.city,
		unit: req.body.unit,
	};

	const division = await Division.findByIdAndUpdate(
		req.params.id,
		fieldsToUpdate,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!division) {
		return next(new ErrorResponse(`Division Not Update`, 202));
	}

	if (division) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Division Updated Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: 'Division data Updated',
		data: division,
	});
});

// @desc    Delete Division Details
// @routes  DELETE /api/v1/division/delete/:id
// @access  Private
exports.deleteDivision = asyncHandler(async (req, res, next) => {
	// await Division.deleteMany();
	const division = await Division.findByIdAndDelete(req.params.id);

	if (!division) {
		return next(new ErrorResponse(`Division Not Deleted`, 204));
	}

	if (division) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Division Deleted Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: 'Division data Deleted',
		data: {},
	});
});
