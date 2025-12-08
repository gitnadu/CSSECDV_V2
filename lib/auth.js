import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '1h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate JWT access token
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      type: "refresh",
    },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );
}

/**
 * Parse refresh expiry into a date
 */
export function getExpirationDate(expiry) {
  const now = new Date();
  const match = expiry.match(/^(\d+)([dhm])$/);

  if (!match) return new Date(now.getTime() + 7 * 86400 * 1000);

  const value = parseInt(match[1]);
  const unit = match[2];

  const map = {
    d: value * 86400 * 1000,
    h: value * 3600 * 1000,
    m: value * 60 * 1000,
  };

  return new Date(now.getTime() + (map[unit] || 0));
}

/**
 * Verify token safely
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
