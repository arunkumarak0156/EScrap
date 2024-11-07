const ErrorResponse = require('../utils/errorResponse');
const { log } = require('../controllers/logger');

const errorHandler = (err, req, res, next) => {
	let error = { ...err };

	error.message = err.message;

	if (err.name === 'CastError') {
		const message = `No record Found with ${err.value}`;
		error = new ErrorResponse(message, 202);
	}

	if (err.code === 11000) {
		const message = 'Duplicate Field Value Entered';
		error = new ErrorResponse(message, 202);
	}

	if (err.name === 'ValodarionError') {
		const message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 202);
	}

	let user;
	if (req.user) {
		user = req.user._id;
	} else {
		user = '';
	}
	const data = {
		logType: 'error',
		method: req.originalUrl.slice(8),
		message: error.message,
		user,
	};
	log(data);

	res.status(error.statusCode || 500).json({
		success: false,
		message: error.message || `Server Error`,
	});
};

module.exports = errorHandler;
