const express = require('express');
const router = express.Router();

const controller = require('../controllers/adminController');

router.post('/addProduct', controller.addProduct);
router.get('/getProduct', controller.getAllProducts);
router.get('/:id', controller.getProduct);
router.post('/editProduct/:id', controller.editProduct);
router.delete('/deleteProduct/:id', controller.deleteProduct);

module.exports = router;
