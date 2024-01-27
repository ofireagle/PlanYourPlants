const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');

router.route('/')
    .get(familyController.getAllFamilies)

router.route('/addNew')
    .post(familyController.createFamily)

router.route('/search')
    .get(familyController.searchFamilies)

router.route('/:id')
    .get(familyController.getFamily)
    .patch(familyController.updateFamily)
    .delete(familyController.deleteFamily)


module.exports = router;