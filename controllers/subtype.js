const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Division = require('../models/Divison');
const Type = require('../models/Type');
const SubType = require('../models/SubType');
const { log } = require('./logger');

// @desc    Get All Sub Type data
// @routes  GET /api/v1/subtype/getall
// @access  Private
exports.getAllSubType = asyncHandler(async (req, res, next) => {
	const subtypes = await SubType.find({ active: true });

	if (!subtypes) {
		return next(new ErrorResponse(`Sub Type Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'All Sub Type data',
		total: subtypes.length,
		data: subtypes,
	});
});

// @desc    Get Sub Type Data By Id
// @routes  GET /api/v1/subtype/details/:id
// @access  Private
exports.getSubTypeById = asyncHandler(async (req, res, next) => {
	const subtype = await SubType.findById({ _id: req.params.id, active: true });

	if (!subtype) {
		return next(new ErrorResponse(`Sub Type Data Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'Sub Type data',
		data: subtype,
	});
});

// @desc    Get Sub Type Data By Type Id
// @routes  GET /api/v1/subtype/type/:id
// @access  Private
exports.getSubTypeByTypeId = asyncHandler(async (req, res, next) => {
	const subtype = await SubType.find({ type: req.params.id, active: true });

	if (!subtype) {
		return next(new ErrorResponse(`Sub Type Data Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'Type Sub Type data',
		total: subtype.length,
		data: subtype,
	});
});

// @desc    Get Sub Type Data By Division & Type Id
// @routes  GET /api/v1/subtype/type/:division/:type
// @access  Private
exports.getSubTypeByDivisionTypeId = asyncHandler(async (req, res, next) => {
	const subtype = await SubType.find({
		division: req.params.division,
		type: req.params.type,
	});

	if (!subtype) {
		return next(new ErrorResponse(`Sub Type Data Not Available`, 204));
	}

	return res.status(200).json({
		success: true,
		message: 'Type Sub Type data',
		total: subtype.length,
		data: subtype,
	});
});

// @desc    Create Sub Type
// @routes  POST /api/v1/subtype/create
// @access  Private
exports.createSubType = asyncHandler(async (req, res, next) => {
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

    const type = await Type.findById(req.body.type);
	if (!type) {
		return next(
			new ErrorResponse(
				`Type not exist with ID ${req.body.type}`,
				204
			)
		);
	}

	const subTypeData = await SubType.findOne({
		$and: [
			{ division: req.body.division },
			{ type: req.body.type },
			{ subTypeName: req.body.subTypeName },
		],
	});

	if (subTypeData) {
		return next(
			new ErrorResponse(`Division, Type and Sub Type Allreasy Exist`, 202)
		);
	}

	const subtype = await SubType.create(req.body);

	if (!subtype) {
		return next(new ErrorResponse(`Sub type Data Not Created`, 204));
	}

	if (subtype) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Sub Type Created Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(201).json({
		success: true,
		message: 'Sub Type Created',
		data: subtype,
	});
});

// @desc    Update Sub TypeDetails
// @routes  PUT /api/v1/subtype/update/:id
// @access  Private
exports.updateSubType = asyncHandler(async (req, res, next) => {
    const division = await Division.findById(req.body.division);
	if (!division) {
		return next(
			new ErrorResponse(
				`Division not exist with ID ${req.body.division}`,
				204
			)
		);
	}

    const type = await Type.findById(req.body.type);
	if (!type) {
		return next(
			new ErrorResponse(
				`Type not exist with ID ${req.body.type}`,
				204
			)
		);
	}
    
	const fieldsToUpdate = {
		subTypeName: req.body.subTypeName,
		type: req.body.type,
		division: req.body.division,
	};

	const subTypeData = await SubType.findOne({
		$and: [
			{ division: req.body.division },
			{ type: req.body.type },
			{ subTypeName: req.body.subTypeName },
		],
	});

	if (subTypeData) {
		return next(new ErrorResponse(`Type and Sub Type Allreasy Exist`, 204));
	}

	const subtype = await SubType.findByIdAndUpdate(
		req.params.id,
		fieldsToUpdate,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!subtype) {
		return next(new ErrorResponse(`Sub Type Data Not Updated`, 202));
	}

	if (subtype) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Sub Type Updated Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: 'Sub Type Updated',
		data: subtype,
	});
});

// @desc    Delete Sub Type Details
// @routes  DELETE /api/v1/subtype/delete/:id
// @access  Private
exports.deleteSubType = asyncHandler(async (req, res, next) => {
	const subtype = await SubType.findByIdAndDelete(req.params.id);

	if (!subtype) {
		return next(new ErrorResponse(`Sub Type Data Not Deleted`, 204));
	}
	if (subtype) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Sub Type Deleted Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: 'Sub Type Deleted',
		data: {},
	});
});
