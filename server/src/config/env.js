import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(5000),
  databaseUrl: z.string().url(),
  databaseSsl: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),
  testDatabaseUrl: z.string().url().optional(),
  clientOrigin: z.string().default('http://localhost:5173'),
  authMode: z.enum(['dev', 'jwt']).default('jwt'),
  devUserId: z.string().default('demo-user-uuid'),

  // Auth / JWT
  jwtSecret: z.string().min(16).default('nutriguard-dev-secret-change-me'),
  jwtExpiresIn: z.string().default('7d'),

  // Email / SMTP
  emailUser: z.string().optional(),
  emailPass: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().default(587),
  smtpSecure: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),

  // LLM
  llmProviders: z.string().default('mock'),
  groqApiKey: z.string().optional(),
  groqModel: z.string().default('llama-3.1-70b-versatile'),
  geminiApiKey: z.string().optional(),
  geminiModel: z.string().default('gemini-2.0-flash'),
  ollamaBaseUrl: z.string().optional(),
  ollamaModel: z.string().default('mistral'),
  llmRpmGroq: z.coerce.number().default(30),
  llmRpmGemini: z.coerce.number().default(60),
  llmDailyTokenBudget: z.coerce.number().default(100000),
  allowFreetierDataSharing: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),

  // Products
  productsProvider: z.enum(['seed', 'off']).default('seed'),
  offUserAgent: z.string().default('NUTRIGUARD/1.0 (localhost)'),

  // Places
  placesProvider: z.enum(['mock', 'osm']).default('mock'),
  overpassEndpoints: z.string().default('https://overpass-api.de/api/interpreter'),
  nominatimUrl: z.string().default('https://nominatim.openstreetmap.org'),
  osmUserAgent: z.string().default('NUTRIGUARD/1.0 (localhost)'),
  placesCacheTtlHours: z.coerce.number().default(24),
  defaultLat: z.coerce.number().default(51.5074),
  defaultLng: z.coerce.number().default(-0.1278),

  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

let config;

try {
  config = envSchema.parse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL,
    databaseSsl: process.env.DATABASE_SSL,
    testDatabaseUrl: process.env.TEST_DATABASE_URL,
    clientOrigin: process.env.CLIENT_ORIGIN ?? (process.env.NODE_ENV === 'test' ? 'http://localhost:5173' : undefined),
    authMode: process.env.AUTH_MODE ?? (process.env.NODE_ENV === 'test' ? 'jwt' : undefined),
    devUserId: process.env.DEV_USER_ID,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    llmProviders: process.env.LLM_PROVIDERS,
    groqApiKey: process.env.GROQ_API_KEY,
    groqModel: process.env.GROQ_MODEL,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
    ollamaModel: process.env.OLLAMA_MODEL,
    llmRpmGroq: process.env.LLM_RPM_GROQ,
    llmRpmGemini: process.env.LLM_RPM_GEMINI,
    llmDailyTokenBudget: process.env.LLM_DAILY_TOKEN_BUDGET,
    allowFreetierDataSharing: process.env.ALLOW_FREE_TIER_DATA_SHARING,
    productsProvider: process.env.PRODUCTS_PROVIDER,
    offUserAgent: process.env.OFF_USER_AGENT,
    placesProvider: process.env.PLACES_PROVIDER,
    overpassEndpoints: process.env.OVERPASS_ENDPOINTS,
    nominatimUrl: process.env.NOMINATIM_URL,
    osmUserAgent: process.env.OSM_USER_AGENT,
    placesCacheTtlHours: process.env.PLACES_CACHE_TTL_HOURS,
    defaultLat: process.env.DEFAULT_LAT,
    defaultLng: process.env.DEFAULT_LNG,
    logLevel: process.env.LOG_LEVEL,
  });

  // Development authentication must never be enabled on a production service.
  if (config.authMode === 'dev' && config.nodeEnv === 'production') {
    throw new Error('AUTH_MODE=dev is not allowed in production');
  }

  // Production must use operator-provided secrets and email credentials.
  if (config.nodeEnv === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16)) {
    throw new Error('JWT_SECRET must be set to a value of at least 16 characters in production');
  }
  if (config.nodeEnv === 'production' && (!config.emailUser || !config.emailPass)) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured in production');
  }
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}

export default config;
