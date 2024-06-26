const express = require('express');
const router = express.Router();
const PublicController = require('../../controllers/public/PublicController.js');

router.get('/image/:imageId', PublicController.getImage);

router.get('/product/:productId', PublicController.getProduct);

module.exports = router;