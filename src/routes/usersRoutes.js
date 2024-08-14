const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { onboard, updateUserDetails, getUserDetails } = require('../controller/userController');
require('dotenv').config(); 

// Initialize the router
const router = express.Router();

router.post('/onboard', authMiddleware, onboard);

// Route for updating user details
router.put('/update-details', authMiddleware, updateUserDetails);

// Route for getting user details
router.get('/details', authMiddleware, getUserDetails);

module.exports = router;
