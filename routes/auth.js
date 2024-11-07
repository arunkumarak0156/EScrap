const express = require('express');
const {
	register,
	login,
	logout,
	getMe,
	updateUser,
	deleteUser,
	updateUserPassword,
} = require('../controllers/auth');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
	.route('/register')
	.post(protect, authorize('SuperAdmin', 'Admin'), register);
router.route('/login').post(login);
router.route('/logout').get(protect, logout);
router.route('/user').get(protect, getMe);
router.route('/update').put(protect, updateUser);
router.route('/updatepassword').put(protect, updateUserPassword);
router
	.route('/delete')
	.delete(protect, authorize('SuperAdmin', 'Admin'), deleteUser);

module.exports = router;
