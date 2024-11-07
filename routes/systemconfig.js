const express = require('express');
const {
	getSystemCongif,
	createSystemConfig,
	connectSystem,
} = require('../controllers/systemconfig');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// router.use(protect);
// router.use(authorize('Admin', 'User'));

router.route('/').get(getSystemCongif).post(createSystemConfig);
router.route('/connect').post(connectSystem);

module.exports = router;
