const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const googleController = require('../controllers/googleController');

router.get('/auth-url', auth, googleController.getAuthUrl);
router.get('/callback', googleController.handleCallback);
router.get('/calendars', auth, googleController.getCalendars);

module.exports = router;
