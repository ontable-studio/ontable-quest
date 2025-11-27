import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env' });

// Validate required environment variables
function validateEnvironment() {
  const required = ['STORAGE_KV_REST_API_URL', 'STORAGE_KV_REST_API_TOKEN'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Initialize Redis connection with validation
function initializeRedis() {
  validateEnvironment();

  return new Redis({
    url: process.env.STORAGE_KV_REST_API_URL,
    token: process.env.STORAGE_KV_REST_API_TOKEN,
    retry: 3,
    backoff: (retry) => Math.pow(2, retry) * 100,
  });
}

// Validate user input data
function validateUserData(email, name, password) {
  if (!email || !name || !password) {
    throw new Error('Email, name, and password are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
}

async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, 12);
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`);
  }
}

async function createAdminAccount(email = null, name = null, password = null) {
  let redis;

  try {
    console.log('🚀 Creating admin account...');

    // Use provided values or environment variables or defaults
    email = email || process.env.ADMIN_EMAIL || 'ontablestudio@gmail.com';
    name = name || process.env.ADMIN_NAME || 'ontable';
    password = password || process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error('Password must be provided either as argument or ADMIN_PASSWORD environment variable');
    }

    // Validate input
    validateUserData(email, name, password);
    console.log(`✓ Input validation passed for email: ${email}`);

    // Initialize Redis connection
    redis = initializeRedis();

    // Test Redis connection
    await redis.ping();
    console.log('✓ Redis connection established');

    // Check if user already exists
    const existingUserId = await redis.get(`user_email:${email}`);
    if (existingUserId) {
      const existingUser = await redis.hgetall(`user:${existingUserId}`);
      console.log('⚠️  User with this email already exists');
      console.log('Existing user details:', {
        id: existingUserId,
        email: existingUser.email || 'N/A',
        name: existingUser.name || 'N/A',
        role: existingUser.role || 'N/A',
        status: existingUser.status || 'N/A'
      });
      return false;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await hashPassword(password);

    // Create admin user
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newUser = {
      id,
      email,
      name,
      role: 'admin',
      status: 'verified',
      provider: 'credentials',
      passwordHash,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    // Store user in Redis with transaction-like behavior
    console.log('💾 Storing user in Redis...');
    await redis.hset(`user:${id}`, newUser);
    await redis.set(`user_email:${email}`, id);

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email:', email);
    console.log('👤 Name:', name);
    console.log('🔑 Role:', 'admin');
    console.log('🆔 User ID:', id);

    return true;

  } catch (error) {
    console.error('❌ Failed to create admin account:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  } finally {
    // Close Redis connection if it was initialized
    if (redis) {
      try {
        // Upstash Redis doesn't have a quit method, just let it cleanup naturally
        redis = null;
      } catch (closeError) {
        console.warn('Warning: Failed to close Redis connection:', closeError.message);
      }
    }
  }
}

// Run the script with command line argument support
async function main() {
  const args = process.argv.slice(2);

  // Support command line arguments: email name password
  let email, name, password;

  if (args.length >= 3) {
    [email, name, password] = args;
  } else if (args.length > 0) {
    console.log('Usage: node create-admin.mjs [email] [name] [password]');
    console.log('Or set environment variables: ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD');
    console.log('Running with environment variables or defaults...\n');
  }

  try {
    const success = await createAdminAccount(email, name, password);

    if (success !== false) {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Script completed - admin account already exists');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
