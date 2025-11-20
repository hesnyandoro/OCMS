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
        
        // Build a recentActivities feed by combining recent deliveries and payments
        const recentDeliveries = await Delivery.find({})
            .sort({ date: -1 })
            .limit(5)
            .populate('farmer', 'name')
            .lean();

        const recentPayments = await Payment.find({})
            .sort({ date: -1 })
            .limit(5)
            .populate('farmer', 'name')
            .lean();

        const mappedDeliveries = recentDeliveries.map(d => ({
            date: d.date,
            farmer: d.farmer?.name || '',
            metric: `${d.kgsDelivered} kgs`,
            type: 'Delivery',
            status: 'Delivered'
        }));

        const mappedPayments = recentPayments.map(p => ({
            date: p.date,
            farmer: p.farmer?.name || '',
            metric: `KES ${p.amountPaid}`,
            type: 'Payment',
            status: p.status || ''
        }));

        // merge, sort by date desc and limit to 8 items
        const recentActivities = [...mappedDeliveries, ...mappedPayments]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);

        // Return keys that match the frontend's expected shape
        res.json({
            totalFarmers: totalFarmers,
            kgsDelivered: totalKgs,
            totalPayments: totalPaid,
            pendingReports: pendingPaymentsCount,
            recentActivities: recentActivities,
        });
    } catch (err) {
        console.error("Dashboard data fetching failed:", err);
        res.status(500).json({ msg: 'Server error while compiling dashboard data.' });
    }
});

module.exports = router;