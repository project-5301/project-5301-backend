const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const { registerUser, registerProvider, loginUser, updatePassword, getUserByEmail, logoutUser, sendOTP, verifyOTP, changePassword } = require('../controller/authController');


router.post('/register', registerUser);




router.post('/provider/register', registerProvider)

router.post('/login', loginUser);


router.post('/update-password', authMiddleware, updatePassword);

router.get("/get-user", authMiddleware, getUserByEmail);


router.post('/logout', authMiddleware, logoutUser);

router.post("/send-email",sendOTP);
router.post("/verify-otp",verifyOTP);
router.put("/reset-password",changePassword);

module.exports = router;