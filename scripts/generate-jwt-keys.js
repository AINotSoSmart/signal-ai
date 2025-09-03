#!/usr/bin/env node

/**
 * Generate JWT keys for Convex Auth
 * This script generates a proper PKCS#8 private key and corresponding public key
 */

import crypto from 'crypto';
import { promisify } from 'util';
const generateKeyPair = promisify(crypto.generateKeyPair);

async function generateJWTKeys() {
  try {
    console.log('Generating JWT key pair...');
    
    // Generate RSA key pair
    const { publicKey, privateKey } = await generateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    console.log('\n=== JWT PRIVATE KEY (PKCS#8 format) ===');
    console.log('Copy this value for JWT_PRIVATE_KEY:');
    console.log('\n' + privateKey);
    
    console.log('\n=== JWT PUBLIC KEY ===');
    console.log('Copy this value for JWKS (if needed):');
    console.log('\n' + publicKey);
    
    console.log('\n=== INSTRUCTIONS ===');
    console.log('1. Copy the PRIVATE KEY (including BEGIN/END lines) to your environment variables');
    console.log('2. In Convex dashboard, set JWT_PRIVATE_KEY to the private key value');
    console.log('3. In your .env.local, set JWT_PRIVATE_KEY to the private key value');
    console.log('4. Make sure to include the entire key including the BEGIN and END lines');
    console.log('\nNote: The private key should be a single line when stored in environment variables.');
    console.log('Replace newlines with \\n when setting in environment variables.');
    
  } catch (error) {
    console.error('Error generating JWT keys:', error);
    process.exit(1);
  }
}

generateJWTKeys();