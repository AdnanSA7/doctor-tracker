import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin } from '../../models/Admin.js';
import { LoginInput } from '@doctor-tracker/shared';
import { JwtPayload } from '../../middleware/auth.js';
import '../../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-secret-key-12345';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;

  const admin = await Admin.findOne({ email });
  if (!admin || !admin.isActive) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
    return;
  }

  const payload: JwtPayload = {
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  if (req.session) {
    (req.session as any).adminId = admin._id.toString();
    (req.session as any).email = admin.email;
  }

  res.json({
    success: true,
    data: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  };
  res.clearCookie('token', cookieOpts);
  res.clearCookie('connect.sid', cookieOpts);

  if (req.session) {
    req.session.destroy(() => {
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    });
  } else {
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  }
}

export async function getCurrentAdmin(req: Request, res: Response): Promise<void> {
  const admin = req.admin || (req.adminId ? await Admin.findById(req.adminId) : null);
  if (!admin) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    },
  });
}

export async function streamAuthEvents(req: Request, res: Response): Promise<void> {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let isClosed = false;

    const safeWrite = (data: string) => {
      if (isClosed) return;
      try {
        res.write(`data: ${data}\n\n`);
      } catch (err) {
        isClosed = true;
      }
    };

    safeWrite(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));

    const adminId = req.adminId;

    const intervalId = setInterval(async () => {
      if (isClosed || !adminId) {
        clearInterval(intervalId);
        return;
      }
      try {
        let admin;
        try {
          admin = await Admin.findById(adminId);
        } catch (dbErr) {
          console.error('[SSE] Database error during periodic auth check:', dbErr);
          safeWrite(JSON.stringify({ type: 'REVOKED', message: 'Database error verification' }));
          clearInterval(intervalId);
          isClosed = true;
          res.end();
          return;
        }

        if (!admin || !admin.isActive) {
          safeWrite(JSON.stringify({ type: 'REVOKED', message: 'Access revoked' }));
          clearInterval(intervalId);
          isClosed = true;
          res.end();
          return;
        }

        safeWrite(JSON.stringify({ type: 'PING', timestamp: new Date().toISOString() }));
      } catch (err) {
        console.error('[SSE] Error during periodic auth check:', err);
      }
    }, 15000);

    req.on('close', () => {
      isClosed = true;
      clearInterval(intervalId);
      try {
        res.end();
      } catch (e) {
        // ignore
      }
    });
  } catch (err) {
    console.error('[SSE] Stream initialization error:', err);
    if (!res.headersSent) {
      res.status(500).end();
    }
  }
}
