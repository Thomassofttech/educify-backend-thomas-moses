const express = require('express');
const router = express.Router();
const { listTutors, getTutor } = require('../controllers/tutorController');

router.get('/', listTutors);
router.get('/:id', getTutor);

module.exports = router;
