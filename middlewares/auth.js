const jwt = require('jsonwebtoken');

const restrictToLoggedInUserOnly = async (req, res, next) => {
  try {
    // 1. Grab the token cookie from the request headers
    const token = req.cookies?.token;

    // 2. If no token badge exists, block access immediately
    if (!token) {
      return res.status(401).json({ message: 'Access Denied: No Token Provided. Please login.' });
    }

    // 3. Verify that the token is authentic and hasn't been altered
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsync_super_secret_key');
    
    // 4. Attach the decoded user data (like userId) to the request object
    req.user = decoded;
    
    // 5. Pass control to the next function (the actual route logic)
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Access unauthorized.' });
  }
};

// Export the function inside an object so it can be destructured cleanly in your routes
module.exports = { restrictToLoggedInUserOnly };