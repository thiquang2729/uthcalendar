const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const syncController = require('../controllers/syncController');

router.post('/run', auth, syncController.runSync);

module.exports = router;
