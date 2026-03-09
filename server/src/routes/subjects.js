const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subjectsController = require('../controllers/subjectsController');

router.get('/', auth, subjectsController.getSubjects);
router.put('/:code', auth, subjectsController.updateSubject);

module.exports = router;
