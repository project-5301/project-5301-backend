const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const { registerUser, loginUser, forgetPassword, updatePassword, getUserByEmail, logoutUser, sendOTP, verifyOTP, changePassword } = require('../controller/authController');


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userName
 *         - userEmail
 *         - password
 *       properties:
 *         userName:
 *           type: string
 *         userEmail:
 *           type: string
 *         password:
 *           type: string
 *         isJobProvider:
 *           type: boolean
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/forget:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: User does not exist
 *       500:
 *         description: Server error
 */
router.post('/forget', forgetPassword);

router.post('/update-password', authMiddleware, updatePassword);

//get user details
router.get("/get-user", authMiddleware, getUserByEmail);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: No token provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/logout', authMiddleware, logoutUser);

router.post("/send-email",sendOTP);
router.post("/verify-otp",verifyOTP);
router.put("/reset-password",changePassword);

module.exports = router;