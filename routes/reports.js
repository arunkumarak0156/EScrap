const express = require('express');
const {
	getTransactionStatus,
	searchBy,
	searchByDate,
} = require('../controllers/reports');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin','Admin', 'Operator', 'Manager', 'Vendor'));

router.route('/transaction/:from/:to').get(searchByDate);
router.route('/transaction/:search').get(searchBy);
router.route('/datasync/:searchtext/:division').get(getTransactionStatus);

module.exports = router;