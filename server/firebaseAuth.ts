// Removed demo user session logic
// import session from 'express-session';

// Removed session configuration
// export function getSession() {
//   return session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: true }
//   });
// }

// Removed demo auth setup
// export function setupAuth(app) {
//   app.use(getSession());
//   // Removed demo user session creation
// }

// Removed logout logic
// export function logout(req, res) {
//   req.session.destroy(() => {
//     res.redirect('/');
//   });
// }

import { Request, Response, NextFunction } from 'express';
import { auth } from './firebase';

// Middleware to verify Firebase ID token from Authorization header
export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}