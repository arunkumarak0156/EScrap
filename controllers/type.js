const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Division = require('../models/Divison');
const Type = require('../models/Type');
const { log } = require('./logger');

// @desc    Get All Type Data
// @routes  GET /api/v1/type/getall
// @access  Private
exports.getAllTypes = asyncHandler(async (req, res, next) => {
	const types = await Type.find({ active: true });

	if (!types) {
		return next(new ErrorResponse(`Type Data Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'All Types data',
		total: types.length,
		data: types,
	});
});

// @desc    Get Type Data By Id
// @routes  GET /api/v1/type//details/:id
// @access  Private
exports.getTypeById = asyncHandler(async (req, res, next) => {
	const type = await Type.findById({
		_id: req.params.id,
		active: true,
	});

	if (!type) {
		return next(new ErrorResponse(`Type Data Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'Type data',
		data: type,
	});
});

// @desc    Get Type Data By Division Id
// @routes  GET /api/v1/type/division/:id
// @access  Private
exports.getTypeByDivisionId = asyncHandler(async (req, res, next) => {
	const type = await Type.find({
		division: req.params.id,
		active: true,
	});

	if (!type) {
		return next(new ErrorResponse(`Type Data Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'Division Type data',
		total: type.length,
		data: type,
	});
});

// @desc    Create Type
// @routes  POST /api/v1/type/create
// @access  Private
exports.createType = asyncHandler(async (req, res, next) => {
	req.body.userId = req.user._id;
	const division = await Division.findById(req.body.division);
	if (!division) {
		return next(
			new ErrorResponse(
				`Division not exist with ID ${req.body.division}`,
				204
			)
		);
	}

	const typedata = await Type.findOne({
		$and: [{ division: req.body.division }, { typeName: req.body.typeName }],
	});

	if (typedata) {
		return next(new ErrorResponse(`Division and Type Allready Exist`, 202));
	}

	const type = await Type.create(req.body);

	if (!type) {
		return next(new ErrorResponse(`Type Not Created`, 204));
	}

	if (type) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Type Created Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(201).json({
		success: true,
		message: 'Type Created',
		data: type,
	});
});

// @desc    Update Type Details
// @routes  PUT /api/v1/type/update/:id
// @access  Private
exports.updateType = asyncHandler(async (req, res, next) => {
    const division = await Division.findById(req.body.division);
	if (!division) {
		return next(
			new ErrorResponse(
				`Division not exist with ID ${req.body.division}`,
				204
			)
		);
	}
    
	const fieldsToUpdate = {
		typeName: req.body.typeName,
		division: req.body.division,
	};

	const typedata = await Type.findOne({
        $and: [{ division: req.body.division }, { typeName: req.body.typeName }],
	});

	if (typedata) {
		return next(new ErrorResponse(`Division and Type Allready Exist`, 204));
	}

	const type = await Type.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	if (!type) {
		return next(new ErrorResponse(`Type Not Updated`, 202));
	}

	if (type) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Type Updated Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: 'Type data Updated',
		data: type,
	});
});

// @desc    Delete Type Details
// @routes  DELETE /api/v1/type/delete/:id
// @access  Private
exports.deleteType = asyncHandler(async (req, res, next) => {
	const type = await Type.findByIdAndDelete(req.params.id);

	if (!type) {
		return next(new ErrorResponse(`Type Not Deletd`, 204));
	}

	if (type) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Type Deleted Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: 'Type data Deleted',
		data: {},
	});
});
