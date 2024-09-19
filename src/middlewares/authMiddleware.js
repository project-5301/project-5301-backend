const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");

const secret = process.env.SECRETKEY;

const authMiddleware = async (req, res, next) => {
  // Get token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {

    // Verify the token
    const decoded = jwt.verify(token, secret);

     const userId = decoded.id;

     // Find the user by ID
     const user = await User.findById(userId);
     if (!user) {
       return res.status(404).json({ message: "User not found" });
     }
 if (user.isTokenBlacklisted(token)) {
   return res.status(401).json({ message: "Token is blacklisted. Please login again" });
 }
    // Attach user information to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Token verification failed
    res.status(401).json({ message: "Token is not valid", error: err.message });
  }
};

module.exports = authMiddleware;
