import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const COOKIE_NAME = 'gc_session_id';
const COOKIE_AGE_DAYS = 30;

export async function getOrCreateSessionId() {
  const store = await cookies();
  let sid = store.get(COOKIE_NAME)?.value;
  if (!sid) {
    sid = randomBytes(16).toString('hex');
    store.set(COOKIE_NAME, sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: COOKIE_AGE_DAYS * 24 * 60 * 60,
    });
  }
  return sid;
}
