const express = require('express');

const router = express.Router();

const controller = require('../controllers/cartController');

router.post('/addToCart', controller.addProductToCart);
router.get('/getCart', controller.getCart);
router.delete('/deleteItem', controller.postDeleteCartProduct);
router.post('/create-order', controller.postOrder);
router.get('/orders', controller.getOrders);

module.exports = router;
