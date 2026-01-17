/**
 * Cryptography Utilities
 * Encrypt/decrypt sensitive data like OAuth tokens
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derive encryption key from NEXTAUTH_SECRET
 * Uses SHA-256 to ensure consistent key length
 */
function getEncryptionKey(): Buffer {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error('NEXTAUTH_SECRET is required for encryption');
    }
    return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param plaintext - The string to encrypt
 * @returns Base64 encoded string containing IV + AuthTag + Ciphertext
 */
export function encrypt(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Combine IV + AuthTag + Ciphertext into single base64 string
    const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'base64'),
    ]);

    return combined.toString('base64');
}

/**
 * Decrypt ciphertext encrypted with encrypt()
 * @param ciphertext - Base64 encoded string from encrypt()
 * @returns Original plaintext string
 */
export function decrypt(ciphertext: string): string {
    const key = getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract IV, AuthTag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Check if a string appears to be encrypted (basic heuristic)
 * Encrypted strings are base64 and at least IV_LENGTH + AUTH_TAG_LENGTH bytes
 */
export function isEncrypted(value: string): boolean {
    try {
        const buffer = Buffer.from(value, 'base64');
        // Minimum length: IV + AuthTag + at least 1 byte of data
        return buffer.length > IV_LENGTH + AUTH_TAG_LENGTH;
    } catch {
        return false;
    }
}
