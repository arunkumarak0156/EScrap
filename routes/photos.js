const express = require('express');
const {
	getPhotos,
	getPhoto,
	uploadPhoto,
    createPhoto,
	updatePhoto,
	deletePhoto,
} = require('../controllers/photos');
const upload = require('../middleware/multer');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.route('/').get(getPhotos).delete(deletePhoto);
router.route('/uploads/').post(upload.array('file'), createPhoto);
router.route('/:id').get(getPhoto).put(updatePhoto).delete(deletePhoto);

module.exports = router;
