const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const eventsController = require('../controllers/eventsController');

router.get('/', auth, eventsController.getEvents);
router.post('/', auth, eventsController.createEvent);

module.exports = router;
