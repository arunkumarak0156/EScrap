const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	userName: {
		type: String,
        maxlength: [30, `Name should less then 30 character's`],
	},
	logedIn: {
		type: Date,
		default: Date.now,
	},
	logedOut: {
		type: Date,
	},
	userIP: {
		type: String,
	},
});

// UserActivitySchema.methods.getActivityToken = async function () {
// 	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
// 		expiresIn: process.env.JWT_EXPIRE,
// 	});
// };

module.exports = mongoose.model('UserActivity', UserActivitySchema);
