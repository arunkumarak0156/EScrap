const express = require('express');
const {
	getSetting,
	createSetting,
	updateSetting,
} = require('../controllers/setting');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getSetting);
router.route('/').post(protect, authorize('Admin'), createSetting);
router.route('/:id').put(protect, authorize('Admin'), updateSetting);

module.exports = router;
