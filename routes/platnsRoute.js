const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const authController = require('../controllers/authControllers');
const multer = require("multer");
const Upload = multer();

router.route('/')
    .get(plantController.getAllPlants)

router.route('/addNew')
    .post(plantController.addPlant)

router.route('/getPlants')
    .post(plantController.getPlants)

router.route('/identifyPlant')
    .post(authController.protect, Upload.single('image'), plantController.IdentifyPlant);

router.route('/getWeather/:id')
    .get(plantController.getWeather)

router.route('/getRandom')
    .get(plantController.getRadmonPlant)


router.route('/getPlan/:id')
    .get(plantController.getPlan)

router.route('/search')
    .get(plantController.searchPlants)

router.route('/:id')
    .patch(plantController.updatPlant)
    .get(plantController.getPlant)
    .delete(plantController.deletePlant)

module.exports = router;