import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import pool from '../db/pool.js';
import config from '../config/env.js';

const email = 'auth-test@example.com';

if (config.authMode !== 'jwt') {
  throw new Error('Backend tests require AUTH_MODE=jwt');
}

async function cleanUser() {
  await pool.query('DELETE FROM medical_profiles WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [email]);
  await pool.query('DELETE FROM otps WHERE email = $1', [email]);
  await pool.query('DELETE FROM users WHERE email = $1', [email]);
}

describe('Authentication API', () => {
  beforeEach(async () => {
    await cleanUser();
  });

  it('registers, exposes a development OTP, verifies, and protects medical profile', async () => {
    const register = await request(app).post('/api/auth/register').send({
      name: 'Auth Test User',
      country: 'Testland',
      age: 30,
      email,
      phone: '+10000000000',
      password: 'correct horse battery staple',
    });

    expect(register.status).toBe(201);
    expect(register.body.otp).toMatch(/^\d{6}$/);

    const verify = await request(app).post('/api/auth/verify-otp').send({
      email,
      otp: register.body.otp,
    });

    expect(verify.status).toBe(200);
    expect(verify.body.token).toEqual(expect.any(String));
    expect(verify.body.user.email).toBe(email);

    const withoutToken = await request(app).get('/api/auth/medical-profile');
    expect(withoutToken.status).toBe(401);

    const saveProfile = await request(app)
      .post('/api/auth/medical-profile')
      .set('Authorization', `Bearer ${verify.body.token}`)
      .send({ height_cm: 180, weight_kg: 80, diseases: 'none' });

    expect(saveProfile.status).toBe(200);
    expect(Number(saveProfile.body.medicalProfile.height_cm)).toBe(180);

    const profile = await request(app)
      .get('/api/auth/medical-profile')
      .set('Authorization', `Bearer ${verify.body.token}`);

    expect(profile.status).toBe(200);
    expect(profile.body.medicalProfile.user_id).toBe(verify.body.user.id);
  });

  it('rejects invalid OTPs and wrong credentials', async () => {
    const register = await request(app).post('/api/auth/register').send({
      name: 'Auth Test User',
      country: 'Testland',
      age: 30,
      email,
      phone: '+10000000000',
      password: 'password-123',
    });

    const invalidOtp = await request(app).post('/api/auth/verify-otp').send({ email, otp: '000000' });
    expect(invalidOtp.status).toBe(400);

    const unverified = await request(app).post('/api/auth/login').send({ email, password: 'password-123' });
    expect(unverified.status).toBe(403);
    expect(unverified.body.error.code).toBe('EMAIL_NOT_VERIFIED');

    const verify = await request(app).post('/api/auth/verify-otp').send({ email, otp: register.body.otp });
    expect(verify.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password' });
    expect(login.status).toBe(401);
  });

  it('rejects malformed and expired tokens', async () => {
    const malformed = await request(app)
      .get('/api/plans/active')
      .set('Authorization', 'Bearer not-a-jwt');
    expect(malformed.status).toBe(401);

    const expired = jwt.sign(
      { userId: 'expired-user', email: 'expired@example.com' },
      config.jwtSecret,
      { expiresIn: -1 }
    );
    const expiredResponse = await request(app)
      .get('/api/plans/active')
      .set('Authorization', `Bearer ${expired}`);
    expect(expiredResponse.status).toBe(401);
  });
});
