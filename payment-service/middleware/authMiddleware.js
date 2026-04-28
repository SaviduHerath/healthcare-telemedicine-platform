import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];

    // Temporary compatibility for frontend admin bypass login.
    // Login stores `admin-dummy-token`, which is not a signed JWT.
    if (token === 'admin-dummy-token') {
      req.user = { role: 'Admin', email: 'admin@gmail.com' };
      return next();
    }

    try {
      // decoded will contain the user ID and data Member 2 put in the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token found' });
  }
};