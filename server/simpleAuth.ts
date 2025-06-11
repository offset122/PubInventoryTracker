import type { RequestHandler } from 'express';
import session from 'express-session';

// Session configuration for Club Jamuhuri
export function getSession() {
  return session({
    secret: 'club-jamuhuri-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req as any).session?.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  (req as any).user = {
    claims: {
      sub: sessionUser.id,
      email: sessionUser.email,
      first_name: sessionUser.firstName,
      last_name: sessionUser.lastName,
      profile_image_url: sessionUser.profileImageUrl
    }
  };
  next();
};

// Simple auth setup
export const setupSimpleAuth = (app: any) => {
  app.use(getSession());
  
  app.get('/api/login', (req: any, res: any) => {
    // Create Club Jamuhuri user session
    const clubUser = {
      id: 'club_jamuhuri_manager',
      email: 'manager@clubjamuhuri.com',
      firstName: 'Club',
      lastName: 'Manager',
      profileImageUrl: null
    };
    
    req.session.user = clubUser;
    res.redirect('/');
  });
  
  app.get('/api/logout', (req: any, res: any) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
};