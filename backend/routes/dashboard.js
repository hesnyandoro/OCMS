const router = require('express').Router();
const Farmer = require('../models/Farmer'); 
const Delivery = require('../models/Delivery'); 
const Payment = require ('../models/Payment');

const SUCCESS_STATUS = ['Completed', 'Paid'];
const PENDING_STATUS = ['Pending', 'Processing', 'Failed'];

// Route to fetch summarized dashboard data
router.get('/summary', async (req, res) => {
    try {
        const totalFarmers = await Farmer.countDocuments({});
        const kgsDeliveredResult = await Delivery.aggregate([
            ({$group: {_id: null, totalKgs: { $sum: "$kgsDelivered" }}})
        ]);
        const totalKgs =kgsDeliveredResult.length > 0 ? kgsDeliveredResult[0].totalKgs : 0;
        const pendingPaymentsResult = await Payment.aggregate([
            {$match: { status: { $in: SUCCESS_STATUS } }},
            { $group: { _id: null, totalAmount: { $sum: "$amountPaid" } } }
        ]);
        const totalPaid = pendingPaymentsResult.length > 0 ? pendingPaymentsResult[0].totalAmount : 0;
        const pendingPaymentsCount = await Payment.countDocuments({ status: { $in: PENDING_STATUS } });
        
        // Return keys that match the frontend's expected shape
        res.json({
            totalFarmers: totalFarmers,
            kgsDelivered: totalKgs,
            totalPayments: totalPaid,
            pendingReports: pendingPaymentsCount,
            recentActivities: [], // Placeholder for recent activity
        });
    } catch (err) {
        console.error("Dashboard data fetching failed:", err);
        res.status(500).json({ msg: 'Server error while compiling dashboard data.' });
    }
});

module.exports = router;