const router = require('express').Router();
const Farmer = require('../models/Farmer'); 
const Delivery = require('../models/Delivery'); 
const Payment = require ('../models/Payment');

const SUCCESS_STATUS = ['Completed', 'Paid'];
const PENDING_STATUS = ['Pending', 'Failed'];

// Route to fetch summarized dashboard data
router.get('/summary', async (req, res) => {
    try {
        const { region, driver, type, date } = req.query;

        const totalFarmers = await Farmer.countDocuments({});

        // Build match filters for deliveries based on provided query params
        const deliveryMatch = {};
        if (region) deliveryMatch.region = region;
        if (driver) deliveryMatch.driver = driver;
        if (type) deliveryMatch.type = type;
        if (date) {
            // Filter for specific date
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            deliveryMatch.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const kgsDeliveredResult = await Delivery.aggregate([
            ...(Object.keys(deliveryMatch).length ? [{ $match: deliveryMatch }] : []),
            { $group: { _id: null, totalKgs: { $sum: "$kgsDelivered" } } }
        ]);
        const totalKgs = kgsDeliveredResult.length > 0 ? kgsDeliveredResult[0].totalKgs : 0;

        // Monthly kgs trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        const monthMatch = { date: { $gte: new Date(new Date(sixMonthsAgo).setHours(0,0,0,0)) } };
        // merge deliveryMatch into monthMatch
        if (Object.keys(deliveryMatch).length) Object.assign(monthMatch, deliveryMatch);
        const kgsByMonthAgg = await Delivery.aggregate([
            { $match: monthMatch },
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
        
        // Count pending/failed payments from Payment collection
        const pendingPaymentsCount = await Payment.countDocuments({ status: { $in: PENDING_STATUS } });
        
        // Count pending deliveries from Delivery collection (paymentStatus: 'Pending')
        const pendingDeliveriesCount = await Delivery.countDocuments({ 
            paymentStatus: 'Pending',
            ...(Object.keys(deliveryMatch).length ? deliveryMatch : {})
        });
        
        // Total pending reports = pending payments + pending deliveries
        const totalPendingReports = pendingPaymentsCount + pendingDeliveriesCount;

        // Payment status distribution - combine Payment collection and Delivery paymentStatus
        // Get payment records status
        const paymentStatusAgg = await Payment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        // Get delivery payment status (Pending/Paid)
        const deliveryPaymentStatusAgg = await Delivery.aggregate([
            ...(Object.keys(deliveryMatch).length ? [{ $match: deliveryMatch }] : []),
            { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
        ]);
        
        // Initialize status object
        const paymentsStatus = { Pending: 0, Completed: 0, Failed: 0 };
        
        // Add Payment collection status
        paymentStatusAgg.forEach(p => { 
            if (p._id && paymentsStatus.hasOwnProperty(p._id)) {
                paymentsStatus[p._id] = p.count || 0; 
            }
        });
        
        // Add Delivery paymentStatus (map "Paid" to "Completed")
        deliveryPaymentStatusAgg.forEach(d => {
            if (d._id === 'Pending') {
                paymentsStatus.Pending += d.count || 0;
            } else if (d._id === 'Paid') {
                paymentsStatus.Completed += d.count || 0;
            }
        });
        
        // Build a recentActivities feed by combining recent deliveries and payments
        // Apply same delivery filters to recent deliveries
        const recentDeliveries = await Delivery.find(Object.keys(deliveryMatch).length ? deliveryMatch : {})
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
            metric: `KES ${Number(p.amountPaid).toFixed(2)}`,
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
            pendingReports: totalPendingReports,
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

// Route to get unique drivers
router.get('/drivers', async (req, res) => {
    try {
        const drivers = await Delivery.distinct('driver');
        res.json(drivers.filter(d => d).sort());
    } catch (err) {
        console.error('Failed to fetch drivers:', err);
        res.status(500).json({ msg: 'Server error while fetching drivers.' });
    }
});

// Route to get unique regions
router.get('/regions', async (req, res) => {
    try {
        const regions = await Delivery.distinct('region');
        res.json(regions.filter(r => r).sort());
    } catch (err) {
        console.error('Failed to fetch regions:', err);
        res.status(500).json({ msg: 'Server error while fetching regions.' });
    }
});

module.exports = router;