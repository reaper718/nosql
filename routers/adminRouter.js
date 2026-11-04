const express = require('express');
const router = express.Router();

const controller = require('../controllers/adminController');
const auth = require('../middelware/auth');

router.post('/addProduct', auth, controller.addProduct);
router.get('/getProduct', auth, controller.getAllProducts);
router.get('/:id', auth, controller.getProduct);
router.post('/editProduct/:id', auth, controller.editProduct);
router.delete('/deleteProduct/:id', auth, controller.deleteProduct);

module.exports = router;
