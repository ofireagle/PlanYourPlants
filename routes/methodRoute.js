const express = require('express');
const router = express.Router();
const methodController = require('../controllers/methodsController');

router.route('')
    .get(methodController.getAllMethods)

router.route('/addNew')
    .post(methodController.addMethod)

router.route('/deleteOne/:id')
    .delete(methodController.deleteMethod)

router.route('/getOne/:id')
    .get(methodController.getMethod)

router.route('/updateOne/:id')
    .patch(methodController.editMethod)

module.exports = router;