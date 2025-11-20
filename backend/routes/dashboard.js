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
        const totalKgs = kgsDeliveredResult.length > 0 ? kgsDeliveredResult[0].totalKgs : 0;

        // Monthly kgs trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        const kgsByMonthAgg = await Delivery.aggregate([
            { $match: { date: { $gte: new Date(sixMonthsAgo.setHours(0,0,0,0)) } } },
            { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, totalKgs: { $sum: "$kgsDelivered" } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Build a map for quick lookup
        const kgsByMonthMap = {};
        kgsByMonthAgg.forEach(item => {
            const m = item._id.month;
            const y = item._id.year;
            kgsByMonthMap[`${y}-${m}`] = item.totalKgs;
        });

        // Helper to format month label
        const monthLabels = [];
        const monthValues = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
            monthLabels.push(label);
            monthValues.push(kgsByMonthMap[key] || 0);
        }
        const pendingPaymentsResult = await Payment.aggregate([
            {$match: { status: { $in: SUCCESS_STATUS } }},
            { $group: { _id: null, totalAmount: { $sum: "$amountPaid" } } }
        ]);
        const totalPaid = pendingPaymentsResult.length > 0 ? pendingPaymentsResult[0].totalAmount : 0;
        const pendingPaymentsCount = await Payment.countDocuments({ status: { $in: PENDING_STATUS } });

        // Payment status distribution
        const paymentStatusAgg = await Payment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const paymentsStatus = { Pending: 0, Completed: 0, Failed: 0 };
        paymentStatusAgg.forEach(p => { paymentsStatus[p._id] = p.count || 0; });
        
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
            monthlyKgs: {
                labels: monthLabels,
                values: monthValues
            },
            paymentsStatus: paymentsStatus
        });
    } catch (err) {
        console.error("Dashboard data fetching failed:", err);
        res.status(500).json({ msg: 'Server error while compiling dashboard data.' });
    }
});

module.exports = router;