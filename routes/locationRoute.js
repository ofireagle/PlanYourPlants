const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationsController');

router.route('')
    .get(locationController.getAllLocatins)

router.route('/addNew')
    .post(locationController.addLocation)

router.route('/deleteOne/:id')
    .delete(locationController.deleteLocation)

router.route('/getOne/:id')
    .get(locationController.getLocation)

router.route('/updateOne/:id')
    .patch(locationController.editLocation)

module.exports = router;