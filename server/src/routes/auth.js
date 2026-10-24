import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import config from '../config/env.js';
import pool from '../db/pool.js';
import { auth } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { hashPassword, comparePassword } from '../services/passwordService.js';

const router = express.Router();
const OTP_EXPIRY_MINUTES = 10;
const BCRYPT_ROUNDS = 12;

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

const getOtp = () => crypto.randomInt(100000, 1000000).toString();

const getToken = (user) => jwt.sign(
  { userId: user.id, email: user.email },
  config.jwtSecret,
  { expiresIn: config.jwtExpiresIn }
);

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  country: user.country,
  age: user.age,
  phone: user.phone,
  isVerified: user.is_verified,
});

const emailConfigured = () => Boolean(config.emailUser && config.emailPass);

let transporter;
const getTransporter = () => {
  if (!transporter) {
    logger.info('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.EMAIL_USER
    });

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.resend.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'resend',
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
};

const sendOtp = async (email, otp) => {
  if (!emailConfigured()) {
    if (config.nodeEnv === 'production') {
      throw new Error('Email delivery is not configured');
    }
    logger.warn('Email is not configured; returning OTP in the response for development');
    return false;
  }

  await getTransporter().sendMail({
    from: config.emailUser,
    to: email,
    subject: 'Your NutriGuard verification code',
    text: `Your NutriGuard verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Your NutriGuard verification code is <strong>${otp}</strong>.</p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
  });
  return true;
};

const createAndSendOtp = async (email) => {
  const otp = getOtp();
  await pool.query('DELETE FROM otps WHERE email = $1', [email]);
  await pool.query(
    `INSERT INTO otps (email, otp_code, expires_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '${OTP_EXPIRY_MINUTES} minutes')`,
    [email, otp]
  );
  const sentByEmail = await sendOtp(email, otp);
  return { otp, sentByEmail };
};

const validationError = (res, message) => res.status(400).json({
  error: {
    message,
    code: 'VALIDATION_ERROR',
    status: 400,
  },
});

// Register a user and send an email verification OTP.
router.post('/register', async (req, res, next) => {
  try {
    const {
      name,
      country,
      age,
      phone,
      password,
    } = req.body || {};
    const email = normalizeEmail(req.body?.email);

    if (!email || !password || !name) {
      return validationError(res, 'Name, email, and password are required');
    }
    if (password.length < 6) {
      return validationError(res, 'Password must be at least 6 characters');
    }

    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    let user;

    if (existing.rows[0]?.is_verified) {
      return res.status(409).json({
        error: {
          message: 'An account with this email already exists',
          code: 'EMAIL_EXISTS',
          status: 409,
        },
      });
    }

    const passwordHash = await hashPassword(password);
    if (existing.rows[0]) {
      const updated = await pool.query(
        `UPDATE users
         SET name = $1, country = $2, age = $3, phone = $4, password_hash = $5
         WHERE email = $6
         RETURNING *`,
        [name, country ?? null, age ?? null, phone ?? null, passwordHash, email]
      );
      user = updated.rows[0];
    } else {
      const created = await pool.query(
        `INSERT INTO users (id, email, name, country, age, phone, password_hash, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
         RETURNING *`,
        [crypto.randomUUID(), email, name, country ?? null, age ?? null, phone ?? null, passwordHash]
      );
      user = created.rows[0];
    }

    const { otp, sentByEmail } = await createAndSendOtp(email);
    const response = {
      message: 'Registration successful. Please verify your email with the OTP sent to you.',
      email,
    };
    if (!sentByEmail) response.otp = otp;
    return res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
});

// Verify an OTP, mark the account as verified, and issue a JWT.
router.post('/verify-otp', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp ?? req.body?.otpCode ?? req.body?.otp_code ?? '').trim();

    if (!email || !otp) {
      return validationError(res, 'Email and OTP are required');
    }

    const otpResult = await pool.query(
      `SELECT * FROM otps
       WHERE email = $1 AND otp_code = $2 AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, otp]
    );
    if (!otpResult.rows[0]) {
      return res.status(400).json({
        error: {
          message: 'Invalid or expired OTP',
          code: 'INVALID_OTP',
          status: 400,
        },
      });
    }

    const userResult = await pool.query(
      `UPDATE users
       SET is_verified = TRUE
       WHERE email = $1
       RETURNING *`,
      [email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          status: 404,
        },
      });
    }

    await pool.query('DELETE FROM otps WHERE email = $1', [email]);
    return res.json({
      message: 'Email verified successfully',
      token: getToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

// Log in with a verified email and password.
router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { password } = req.body || {};

    if (!email || !password) {
      return validationError(res, 'Email and password are required');
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user || !user.password_hash || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
          status: 401,
        },
      });
    }
    if (!user.is_verified) {
      return res.status(403).json({
        error: {
          message: 'Please verify your email before logging in',
          code: 'EMAIL_NOT_VERIFIED',
          status: 403,
        },
      });
    }

    return res.json({
      message: 'Login successful',
      token: getToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

// Load the authenticated user's medical profile.
router.get('/medical-profile', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medical_profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        error: {
          message: 'Medical profile not found',
          code: 'PROFILE_NOT_FOUND',
          status: 404,
        },
      });
    }
    return res.json({ medicalProfile: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

// Save or update the authenticated user's medical profile.
router.post('/medical-profile', auth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const values = [
      req.user.id,
      body.height_cm ?? body.heightCm ?? body.height ?? null,
      body.weight_kg ?? body.weightKg ?? body.weight ?? null,
      body.occupation ?? null,
      body.lifestyle ?? null,
      body.diseases ?? null,
      body.has_diabetes ?? body.hasDiabetes ?? false,
      body.bp_status ?? body.bpStatus ?? null,
      body.workout_routine ?? body.workoutRoutine ?? null,
      body.yoga_practice ?? body.yogaPractice ?? null,
    ];
    const result = await pool.query(
      `INSERT INTO medical_profiles
       (user_id, height_cm, weight_kg, occupation, lifestyle, diseases,
        has_diabetes, bp_status, workout_routine, yoga_practice, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        occupation = EXCLUDED.occupation,
        lifestyle = EXCLUDED.lifestyle,
        diseases = EXCLUDED.diseases,
        has_diabetes = EXCLUDED.has_diabetes,
        bp_status = EXCLUDED.bp_status,
        workout_routine = EXCLUDED.workout_routine,
        yoga_practice = EXCLUDED.yoga_practice,
        updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      values
    );
    return res.status(200).json({ medicalProfile: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

// Resend the verification OTP for an unverified account.
router.post('/resend-otp', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return validationError(res, 'Email is required');
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          status: 404,
        },
      });
    }
    if (user.is_verified) {
      return res.status(400).json({
        error: {
          message: 'Email is already verified',
          code: 'EMAIL_ALREADY_VERIFIED',
          status: 400,
        },
      });
    }

    const { otp, sentByEmail } = await createAndSendOtp(email);
    const response = {
      message: 'A new verification OTP has been sent',
      email,
    };
    if (!sentByEmail) response.otp = otp;
    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

export default router;
