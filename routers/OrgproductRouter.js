const express  = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

router.post('/addProduct', productController.addProduct);
router.get('/getProduct', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.post('/editProduct', productController.editProduct);
router.delete('/deleteProduct/:id', productController.deleteProduct);

module.exports = router;