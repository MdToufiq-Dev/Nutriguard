import crypto from 'crypto';
import logger from '../utils/logger.js';

const SCRYPT_PREFIX = '$scrypt$';
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

let bcryptPromise;

async function loadBcrypt() {
  if (!bcryptPromise) {
    bcryptPromise = import('bcrypt').then((module) => module.default || module).catch((error) => {
      logger.warn({ error: error.message }, 'Native bcrypt unavailable; using scrypt for new passwords');
      return null;
    });
  }
  return bcryptPromise;
}

function scryptAsync(password, salt, options) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

async function hashWithScrypt(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('base64url');
  const derivedKey = await scryptAsync(password, salt, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION,
    maxmem: 32 * 1024 * 1024,
  });
  return `${SCRYPT_PREFIX}${salt}$${derivedKey.toString('base64url')}`;
}

async function compareScrypt(password, storedHash) {
  const [, prefix, salt, encodedKey] = storedHash.split('$');
  if (prefix !== 'scrypt' || !salt || !encodedKey) return false;

  const expected = Buffer.from(encodedKey, 'base64url');
  const actual = await scryptAsync(password, salt, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION,
    maxmem: 32 * 1024 * 1024,
  });
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export async function hashPassword(password) {
  const bcrypt = await loadBcrypt();
  if (bcrypt) return bcrypt.hash(password, 12);
  return hashWithScrypt(password);
}

export async function comparePassword(password, storedHash) {
  if (typeof storedHash !== 'string') return false;
  if (storedHash.startsWith(SCRYPT_PREFIX)) return compareScrypt(password, storedHash);

  const bcrypt = await loadBcrypt();
  if (!bcrypt) {
    logger.warn('Cannot verify a bcrypt password while the native bcrypt binding is unavailable');
    return false;
  }
  return bcrypt.compare(password, storedHash);
}
