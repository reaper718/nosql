const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');

router.post('/addToCart', cartController.addProductToCart);
router.get('/getCart', cartController.getCart);
router.delete('/deleteItem', cartController.postDeleteCartProduct);
router.post('/create-order', cartController.postOrder);
router.get('/orders', cartController.getOrders);

module.exports = router;