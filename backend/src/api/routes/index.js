const { Router } = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const { serve, setup } = require('swagger-ui-express');
const {swaggerOptions} = require('../../../config/index.js');
const user = require('./user.js');
const conference = require('./conference.js');
const booking = require('./booking.js');

// import routes
const router = Router();

// swagger docs
const specDoc = swaggerJsdoc(swaggerOptions);
router.use("/docs", serve);
router.get("/docs", setup(specDoc, { explorer: true }));

// For user routes
router.use('/user', user);
// For conference routes
router.use('/conference', conference);
// For booking routes
router.use('/booking', booking);

module.exports = router;