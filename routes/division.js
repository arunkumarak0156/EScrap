const express = require('express');
const {
	getAllDivisions,
	getDivisionById,
	createDivision,
	updateDivision,
	deleteDivision,
} = require('../controllers/division');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin'));

router.route('/getall').get(getAllDivisions);
router.route('/details/:id').get(getDivisionById);
router.route('/create').post(createDivision);
router.route('/update/:id').put(updateDivision);
router.route('/delete/:id').delete(deleteDivision);

module.exports = router;
