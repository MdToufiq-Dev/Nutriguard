import config from '../config/env.js';

export const auth = (req, res, next) => {
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

  // TODO: Implement JWT verification logic for 'jwt' mode
  // const token = authHeader.split(' ')[1];
  // jwt.verify(token, config.jwtSecret, (err, user) => { ... });

  next();
};
