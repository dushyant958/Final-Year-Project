import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ── Config ──
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '36h';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const app = express();
app.use(cors());
app.use(express.json());

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// In-memory OTP store (use Redis in production)
const otpStore = new Map(); // email -> { otp, expiresAt }

// ── Helpers ──
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

// ── Routes ──

// Google SSO — verify Google ID token, return JWT
app.post('/auth/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Invalid token' });

    const jwt = signToken({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: 'google',
    });

    res.json({ token: jwt, user: { email: payload.email, name: payload.name, picture: payload.picture } });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// Send OTP to email
app.post('/auth/otp/send', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Rate limit: 1 OTP per email per 60 seconds
  const existing = otpStore.get(email);
  if (existing && Date.now() - (existing.createdAt || 0) < 60000) {
    return res.status(429).json({ error: 'OTP already sent. Wait 60 seconds.' });
  }

  const otp = generateOtp();
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, createdAt: Date.now() });

  // Clean up expired OTPs
  for (const [key, val] of otpStore) {
    if (Date.now() > val.expiresAt) otpStore.delete(key);
  }

  try {
    await transporter.sendMail({
      from: `"AQI Dashboard" <${SMTP_USER}>`,
      to: email,
      subject: 'Your login OTP',
      text: `Your OTP is: ${otp}\n\nValid for 10 minutes.\n\nIf you didn't request this, ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem; background: #0a0a0f; color: #fff; border-radius: 12px;">
          <h2 style="margin: 0 0 0.5rem; color: #ff4040;">AQI Dashboard</h2>
          <p style="color: #999; margin: 0 0 1.5rem;">Your login verification code</p>
          <div style="font-size: 2rem; font-weight: 900; letter-spacing: 0.3em; text-align: center; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 1.5rem;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 0.8rem;">Valid for 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('Email send error:', err.message);
    // In dev, still return success and log OTP to console
    if (!SMTP_USER) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      res.json({ message: 'OTP sent (dev mode — check server console)' });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
});

// Verify OTP and return JWT
app.post('/auth/otp/verify', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  const stored = otpStore.get(email);
  if (!stored) return res.status(400).json({ error: 'No OTP found. Request a new one.' });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP expired. Request a new one.' });
  }
  if (stored.otp !== otp) return res.status(400).json({ error: 'Incorrect OTP' });

  // OTP verified — clean up and issue JWT
  otpStore.delete(email);

  const token = signToken({ email, provider: 'email' });
  res.json({ token, user: { email } });
});

// Verify JWT (for protected routes)
app.get('/auth/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    res.json({ user: payload });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  if (!GOOGLE_CLIENT_ID) console.warn('⚠ GOOGLE_CLIENT_ID not set — Google SSO will not work');
  if (!SMTP_USER) console.warn('⚠ SMTP_USER not set — OTPs will only be logged to console');
});
