const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authControllers');

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router.route('/signUp')
    .post(authController.signUp)

router.route('/login')
    .post(authController.login)

router.route('/getUserByToken')
    .get(authController.protect, userController.getUserByToken)
    
router.route('/forgotPassword')
    .post(authController.forgotPassword)

router.route('/resetPassword/:resetToken')
    .patch(authController.resetPassword)

router.route('/getPlants')
    .get(authController.protect, userController.getPlantsList)

router.route('/addPlant')
    .patch(authController.protect, userController.addPlantToUser)

router.route('/updateUser')
    .patch(authController.protect, userController.updateUser)

router.route('/deletePlant')
    .patch(authController.protect,userController.deletePlantFromUserList)

router.route('/:id')
    .get(userController.getUser)
    .delete(userController.deleteUser)

module.exports = router;