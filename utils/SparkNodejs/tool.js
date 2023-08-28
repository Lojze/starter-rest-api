import crypto from 'crypto';

export function utf8 (str) {
    return Buffer.from(str, 'utf8');
}

export function base64 (str) {
    return Buffer.from(str).toString('base64');
}

export function hmac (key, content)  {
    return crypto.createHmac('sha256', key).update(content).digest('base64');
}
