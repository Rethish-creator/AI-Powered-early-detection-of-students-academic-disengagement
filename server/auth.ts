import crypto from 'crypto';
import { User, UserRole } from '../src/types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'academic-disengagement-ai-secret-key-2025';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  studentId?: string;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = 'eng_edu_salt_2025';
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate base64url standard JWT
export function generateToken(user: User): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    studentId: user.studentId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}
