import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, IAdmin } from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-secret-key-12345';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
      adminId?: string;
    }
  }
}

export interface JwtPayload {
  adminId: string;
  email: string;
  role: string;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.',
        },
      });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (jwtErr) {
      console.error('[JWT Verify Error]:', jwtErr);
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token.',
        },
      });
      return;
    }

    let admin;
    try {
      admin = await Admin.findById(decoded.adminId);
    } catch (dbErr) {
      console.error('[Auth Middleware] Database error:', dbErr);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not verify authorization status due to database error.',
        },
      });
      return;
    }

    if (!admin || !admin.isActive) {
      res.clearCookie('token');
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Account has been deactivated or removed. Please log in again.',
        },
      });
      return;
    }

    req.admin = admin;
    req.adminId = admin._id.toString();
    return next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. Insufficient permissions for this role.',
        },
      });
      return;
    }
    next();
  };
}
