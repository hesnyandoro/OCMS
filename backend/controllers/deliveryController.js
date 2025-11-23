const Delivery = require('../models/Delivery');
const User = require('../models/User');

exports.getDeliveries = async (req, res) => {
  try {
    let query = {};

    // Field agents can only see deliveries in their assigned region
    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      // If field agent has assigned region, filter by it
      if (user && user.assignedRegion) {
        query.region = user.assignedRegion;
      }
      // If no region assigned, they can see all deliveries
    }

    const deliveries = await Delivery.find(query)
      .sort({ date: -1 })
      .populate('farmer', 'name cellNumber')
      .populate('createdBy', 'username name');
    res.json(deliveries);
  } catch (err) {
    console.error("DELIVERY FETCH FAILED", err);
    res.status(500).send('Server error');
  }
};

exports.createDelivery = async (req, res) => {
  try {
    // Add createdBy field
    const deliveryData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Field agents with assigned region can only create deliveries in that region
    if (req.user.role === 'fieldagent') {
      const user = await User.findById(req.user.id);
      if (user && user.assignedRegion) {
        // Ensure the delivery region matches assigned region
        if (deliveryData.region !== user.assignedRegion) {
          return res.status(403).json({ 
            msg: `You can only record deliveries in your assigned region: ${user.assignedRegion}` 
          });
        }
      }
      // If no region assigned, they can create deliveries in any region
    }

    const delivery = new Delivery(deliveryData);
    await delivery.save();
    
    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('farmer', 'name cellNumber')
      .populate('createdBy', 'username name');
    res.status(201).json(populatedDelivery);
  } catch (err) {
    console.error('Create delivery error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: Object.values(err.errors).map(e => e.message) });
    }
    res.status(500).send('Server error');
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const updatedDelivery = await Delivery.findByIdAndUpdate(req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('farmer', 'name cellNumber');

    if (!updatedDelivery) {
      return res.status(400).json({ msg: 'Delivery not found' });
    }
    res.json(updatedDelivery);
  } catch (err) {
    console.error("DELIVERY UPDATE FAILED", err.message);
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid ID or validation failed' });
    }
    res.status(500).send('Server error');
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!deletedDelivery) {
      return res.status(400).json({ msg: 'Delivery not found' });
    }
    res.json({ msg: 'Delivery successfully deleted' });

  } catch (err) {
    console.error("DELIVERY DELETE FAILED", err.message);
    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid ID format' });
    }
    res.status(500).send('Server error');
  }
};