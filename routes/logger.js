const express = require('express');
const { getAllLogs } = require('../controllers/logger');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin'));

router.route('/getalllog').get(getAllLogs);

module.exports = router;
