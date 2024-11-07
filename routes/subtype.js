const express = require('express');
const {
	getAllSubType,
	getSubTypeById,
	getSubTypeByTypeId,
	getSubTypeByDivisionTypeId,
	createSubType,
	updateSubType,
	deleteSubType,
} = require('../controllers/subtype');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin'));

router.route('/getall').get(getAllSubType);
router.route('/details/:id').get(getSubTypeById);
router.route('/type/:id').get(getSubTypeByTypeId);
router.route('/divisiontype/:division/:type').get(getSubTypeByDivisionTypeId);
router.route('/create').post(createSubType);
router.route('/update/:id').put(updateSubType);
router.route('/delete/:id').delete(deleteSubType);

module.exports = router;
