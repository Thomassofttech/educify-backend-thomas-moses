const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBooking, getUserBookings } = require('../controllers/bookingController');

router.post('/', auth, createBooking);
router.get('/user/:id', auth, getUserBookings);

module.exports = router;
