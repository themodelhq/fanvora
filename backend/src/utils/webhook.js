import crypto from 'node:crypto'

// PayStack signs every webhook with HMAC-SHA512 over the RAW request body
// using your secret key, sent in the `x-paystack-signature` header.
// Docs: https://paystack.com/docs/payments/webhooks/#verify-event-origin
export function verifyPaystackSignature(rawBody, signature) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || !signature) return false
  const computed = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex')
  // Use timingSafeEqual to avoid leaking comparison time.
  const a = Buffer.from(computed, 'utf8')
  const b = Buffer.from(signature, 'utf8')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
