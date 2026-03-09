const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const logsController = require('../controllers/logsController');

router.get('/', auth, logsController.getLogs);

module.exports = router;
