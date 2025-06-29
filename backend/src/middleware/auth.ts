import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

interface AuthRequest extends Request {
  headers: Request['headers'];
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
      return (res as any).status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
    req.user = decoded;
    next();
  } catch {
    (res as any).status(401).json({ message: 'Invalid token.' });
  }
};

export const requireRole = (roles: string[]): ((req: AuthRequest, res: Response, next: NextFunction) => void) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return (res as any).status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};