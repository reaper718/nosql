const express = require('express');

const router = express.Router();

const controller = require('../controllers/cartController');
const auth = require('../middelware/auth');

router.post('/addToCart/:prodId', auth, controller.addProductToCart);
router.get('/getCart', auth, controller.getCart);
router.delete('/deleteItem/:prodId', auth, controller.postDeleteCartProduct);
router.post('/create-order', auth, controller.postOrder);
router.get('/orders', auth, controller.getOrders);

module.exports = router;
