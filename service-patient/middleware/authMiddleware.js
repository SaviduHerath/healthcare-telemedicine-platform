import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if the request has an authorization header starting with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token from the header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Attach the decoded user info (id and role) to the request object
      req.patient = decoded;

      // 5. Move on to the next function (the controller)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If there is no token at all
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};