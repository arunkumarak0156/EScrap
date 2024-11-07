const express = require('express');
const {
	getUsersCount,
	getUsers,
	getUser,
	createUser,
	updateUser,
	updateUserPassword,
	updateUserRole,
	userActivation,
	deleteUser,
} = require('../controllers/user');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin','Admin'));

router.route('/usercount').get(getUsersCount);
router.route('/getall').get(getUsers);
router.route('/register').post(createUser);
router.route('/details/:id').get(getUser);
router.route('/update/:id').put(updateUser);
router.route('/updatepassword/:id').put(updateUserPassword);
router.route('/updateuserrole/:id').put(updateUserRole);
router.route('/useractivation/:id').put(userActivation);
router.route('/delete/:id').delete(deleteUser);

module.exports = router;
