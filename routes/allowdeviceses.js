const express = require('express');
const {
	getDevicesesCount,
	getDeviceses,
	getDevice,
	registerDevice,
	updateDevice,
	deleteDevice,
} = require('../controllers/allowdeviceses');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin'));

router.route('/count').get(getDevicesesCount);
router.route('/').get(getDeviceses).post(registerDevice);
router.route('/:id').get(getDevice).put(updateDevice).delete(deleteDevice);

module.exports = router;
