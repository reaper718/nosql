const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');

router.post('/addToCart', cartController.addProductToCart);
router.get('/getCart', cartController.getCart);
router.delete('/deleteItem', cartController.postDeleteCartProduct)

module.exports = router;