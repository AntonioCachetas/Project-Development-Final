const jwt = require('jsonwebtoken');
require('dotenv').config(); // for accessing environment variables

const authMiddleware = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    // Verify the token and attach user data to the request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // `decoded` contains the id and email since we included them in the token payload
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
