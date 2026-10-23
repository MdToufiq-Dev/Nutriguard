import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const auth = (req, res, next) => {
  // Dev mode bypass is retained only for legacy local API tests and demos.
  if (config.authMode === 'dev') {
    req.user = { id: config.devUserId };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        status: 401
      }
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
        status: 401
      }
    });
  }
};
