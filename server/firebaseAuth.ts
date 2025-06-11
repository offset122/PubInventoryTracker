import type { RequestHandler } from 'express';
import session from 'express-session';

// Session configuration
export function getSession() {
  return session({
    secret: 'firebase-demo-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

// Simple session-based auth for demo purposes
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Check if user is in session
  const sessionUser = (req as any).session?.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  (req as any).user = sessionUser;
  next();
};

// Demo auth setup with session management
export const setupDemoAuth = (app: any) => {
  // Setup session middleware
  app.use(getSession());
  
  app.get('/api/login', (req: any, res: any) => {
    // Create demo user session
    const demoUser = {
      id: 'demo_user_123',
      email: 'manager@clubjamuhuri.com',
      firstName: 'Club',
      lastName: 'Manager',
      profileImageUrl: null
    };
    
    req.session.user = demoUser;
    res.redirect('/');
  });
  
  app.get('/api/logout', (req: any, res: any) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
};