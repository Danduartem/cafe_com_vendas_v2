import crypto from 'node:crypto';

export default {
  nonce: crypto.randomBytes(16).toString('base64')
};

