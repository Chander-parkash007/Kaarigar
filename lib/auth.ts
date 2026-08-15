import jwt from 'jsonwebtoken'

const SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret'

export function signWorkerToken(workerId: string): string {
  return jwt.sign({ workerId, type: 'worker' }, SECRET, { expiresIn: '7d' })
}

export function verifyWorkerToken(token: string): { workerId: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as { workerId: string; type: string }
    if (payload.type !== 'worker') return null
    return { workerId: payload.workerId }
  } catch { return null }
}

export function signAdminToken(username: string): string {
  return jwt.sign({ username, type: 'admin' }, SECRET, { expiresIn: '8h' })
}

export function verifyAdminToken(token: string): { username: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as { username: string; type: string }
    if (payload.type !== 'admin') return null
    return { username: payload.username }
  } catch { return null }
}

export function signCustomerToken(customerId: string): string {
  return jwt.sign({ customerId, type: 'customer' }, SECRET, { expiresIn: '30d' })
}

export function verifyCustomerToken(token: string): { customerId: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as { customerId: string; type: string }
    if (payload.type !== 'customer') return null
    return { customerId: payload.customerId }
  } catch { return null }
}
