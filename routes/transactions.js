const express = require('express');
const {
	getAllLastTransactionStatus,
	getAllTransactions,
	getTransactionDivisionId,
	getTransactionById,
	getTransactionByGatePassNumber,
	searchByDate,
	searchBy,
	getTransactionThumbnail,
	getTransactionImage,
	createTransaction,
	updateTransaction,
	updateTransactionImage,
	deleteTransaction,
	deleteTransactionImage,
	deleteTransactionImageByThumbnail,
} = require('../controllers/transactions');

const Transactions = require('../models/Transactions');
const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'Operator'));

router.route('/getstatus').get(getAllLastTransactionStatus);
router.route('/getall').get(advancedResults(Transactions), getAllTransactions);
router.route('/txnbydivisionid/:divn').get(getTransactionDivisionId);
router.route('/searchby/:search').get(searchBy);
router.route('/details/:id').get(getTransactionById);
router.route('/erprefno/:erpno').get(getTransactionByGatePassNumber);
router.route('/searchbydate/:from/:to').get(searchByDate);
router.route('/create').post(createTransaction);
router.route('/update/:txnid').put(updateTransaction);
router.route('/update/:id/image').put(updateTransactionImage);
router.route('/:id/thumbnail').get(getTransactionThumbnail);
router.route('/:id/image').get(getTransactionImage);
router.route('/delete/:id/transaction').delete(deleteTransaction);
router.route('/delete/:id/image').delete(deleteTransactionImage);
router.route('/delete/:id/thumbnail').delete(deleteTransactionImageByThumbnail);

module.exports = router;
