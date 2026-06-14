const encoder = new TextEncoder();

async function getSignature(data: string, secret: string): Promise<string> {
  const keyBuffer = encoder.encode(secret);
  const dataBuffer = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    dataBuffer
  );
  
  // Convert signature to hex string
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Signs a session for a given username.
 * Returns a token string: `username|expiry|signature`
 */
export async function signSession(username: string, secret: string, maxAgeInSeconds: number): Promise<string> {
  const expiry = Date.now() + maxAgeInSeconds * 1000;
  const payload = `${username}|${expiry}`;
  const signature = await getSignature(payload, secret);
  return `${payload}|${signature}`;
}

/**
 * Verifies a session token.
 * Returns the username if valid, or null if invalid/expired.
 */
export async function verifySession(token: string | undefined, secret: string): Promise<string | null> {
  if (!token) return null;
  
  try {
    const parts = token.split('|');
    if (parts.length !== 3) return null;
    
    const [username, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr, 10);
    
    // Check if token has expired
    if (isNaN(expiry) || expiry < Date.now()) {
      return null;
    }
    
    const payload = `${username}|${expiry}`;
    const expectedSignature = await getSignature(payload, secret);
    
    if (signature === expectedSignature) {
      return username;
    }
  } catch (error) {
    console.error('Session verification failed:', error);
  }
  
  return null;
}
