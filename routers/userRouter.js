const express = require('express');
const router = express.Router();

const controller = require('../controllers/userController');

router.post('/addUser', controller.addUser);
router.get('/getUser', controller.getUser);

module.exports = router;
