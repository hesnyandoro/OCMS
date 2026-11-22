const express = require('express');
const { body } = require('express-validator');
const { verifyToken, authorize } = require('../middleware/auth');
const { getFarmers, getFarmer, createFarmer, updateFarmer, deleteFarmer, searchFarmers } = require('../controllers/farmerController');

const router = express.Router();

const farmLocationValidators = [
  body('farmLocation.lat')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90')
    .toFloat(),
  body('farmLocation.lng')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180')
    .toFloat(),
  body('farmLocation.address').optional({ nullable: true }).isString().trim(),
];

const createFarmerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('cellNumber').trim().notEmpty().withMessage('Cell number is required'),
  body('nationalId').trim().notEmpty().withMessage('National ID is required'),
  body('season').isIn(['Long', 'Short']).withMessage('Season must be Long or Short'),
  body('weighStation').trim().notEmpty().withMessage('Weigh station/region is required'),
  ...farmLocationValidators,
];

const updateFarmerValidators = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('cellNumber').optional().trim().notEmpty().withMessage('Cell number cannot be empty'),
  body('nationalId').optional().trim().notEmpty().withMessage('National ID cannot be empty'),
  body('season').optional().isIn(['Long', 'Short']).withMessage('Season must be Long or Short'),
  body('weighStation').optional().trim().notEmpty().withMessage('Weigh station/region cannot be empty'),
  ...farmLocationValidators,
];

router.get('/search', verifyToken, authorize('admin', 'fieldagent'), searchFarmers);

router.get('/', verifyToken, authorize('admin', 'fieldagent'), getFarmers);
router.get('/:id', verifyToken, authorize('admin', 'fieldagent'), getFarmer);

router.post('/', verifyToken, authorize('admin', 'fieldagent'), createFarmerValidators, createFarmer);

router.put('/:id', verifyToken, authorize('admin'), updateFarmerValidators, updateFarmer);
router.delete('/:id', verifyToken, authorize('admin'), deleteFarmer);

module.exports = router;
