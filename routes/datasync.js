const express = require('express');
const {
	getUnprossedTransactions,
	getGrossWeight,
	getTareWeight,
	syncGateDetails,
	getAllGateDetails,
	getTransactionStatus,
	getToBeProccessed,
	syncDebitNote,
	syncPcr,
	syncGrossTare,
	syncPODetails,
	syncScrapQuality,
} = require('../controllers/datasync');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin'));

router.route('/allunprossedtransaction').get(getUnprossedTransactions);
router.route('/grossweight').get(getGrossWeight);
router.route('/tareweight').get(getTareWeight);
router.route('/getall').get(getAllGateDetails);
router.route('/datastatus/:searchtext/:division').get(getTransactionStatus);
router.route('/tobeproccessed/:divn/:gpdt').get(getToBeProccessed);
router.route('/gatedetails').post(syncGateDetails);
router.route('/debitnote').post(syncDebitNote);
router.route('/pcr').post(syncPcr);
router.route('/grosstare').post(syncGrossTare);
router.route('/purchaseorder').post(syncPODetails);
router.route('/scrapquality').post(syncScrapQuality);

module.exports = router;
