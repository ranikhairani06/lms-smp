import assert from 'node:assert/strict';

// Run only against the local seeded backend. Temporarily changes the demo
// parent's password and restores it in finally; requires default demo credentials.
const base = 'http://127.0.0.1:3000';
let checks = 0;
function check(condition, label) { assert.ok(condition, label); checks++; console.log(`PASS ${label}`); }
async function request(path, { cookie, body, method = 'GET', origin = base, ...extra } = {}) {
  const response = await fetch(base + path, {
    method, redirect: 'manual', signal: AbortSignal.timeout(30000),
    headers: { 'Content-Type': 'application/json', Origin: origin, ...(cookie ? { Cookie: cookie } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}), ...extra,
  });
  const text = await response.text();
  let json; try { json = JSON.parse(text); } catch { /* HTML page */ }
  return { response, json, text, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
function redirected(result, path) {
  return result.response.headers.get('location') === path || result.text.includes(`url=${path}`);
}
const cookies = [];
let passwordChanged = false;
let parentCookie;
const originalPassword = 'OrtuDev!2026';
const temporaryPassword = 'IntegrationTest!2026';
try {
  check((await request('/login')).response.status === 200, 'login page renders');
  check((await request('/api/me')).response.status === 401, 'anonymous session rejected');
  check(redirected(await request('/siswa'), '/login?role=student'), 'student portal requires student login');
  check((await request('/api/auth/login', { method: 'POST', body: {}, origin: 'https://example.org' })).response.status === 403, 'cross-origin mutation rejected');
  const invalidPayload = await request('/api/auth/login', { method: 'POST', body: null });
  check(invalidPayload.response.status === 400, 'invalid payload rejected');
  check((await request('/api/auth/password', { method: 'POST', body: {} })).response.status === 405, 'wrong method rejected');
  const bad = await request('/api/auth/login', { method: 'POST', body: { username: '0012345671', password: 'wrong', role: 'student' } });
  check(bad.response.status === 422, 'invalid credentials rejected');
  const student = await request('/api/auth/login', { method: 'POST', body: { username: '0012345671', password: '17052012', role: 'student' } });
  check(student.response.status === 200 && student.json.redirect === '/password-update', 'first student login requires password change');
  cookies.push(student.cookie);
  check(!('token' in student.json) && /httponly/i.test(student.response.headers.get('set-cookie')), 'token stays in HttpOnly cookie');
  check(!/max-age/i.test(student.response.headers.get('set-cookie')), 'non-remembered login uses session cookie');
  check(redirected(await request('/siswa', { cookie: student.cookie }), '/password-update'), 'student cannot bypass first password change');
  check((await request('/password-update', { cookie: student.cookie })).text.includes('Budi Santoso'), 'password page shows real account');
  const wrongRole = await request('/api/auth/login', { method: 'POST', body: { username: '0012345671', password: '17052012', role: 'teacher' } });
  check(wrongRole.response.status === 422, 'wrong selected role rejected');
  const parent = await request('/api/auth/login', { method: 'POST', body: { username: 'ortu-0012345671', password: originalPassword, role: 'parent', remember: true } });
  check(parent.response.status === 200 && parent.json.redirect === '/orang-tua', 'parent reaches correct portal');
  parentCookie = parent.cookie; cookies.push(parentCookie);
  check(/max-age=2592000/i.test(parent.response.headers.get('set-cookie')), 'remember me persists cookie for 30 days');
  check((await request('/orang-tua', { cookie: parentCookie })).text.includes('Orang Tua Budi Santoso'), 'portal renders real parent identity');
  check(redirected(await request('/siswa', { cookie: parentCookie }), '/login?role=student&reason=role-mismatch'), 'parent is prompted for student login when opening student portal');
  const invalidChange = await request('/api/auth/password', { method: 'PUT', cookie: parentCookie, body: { current_password: 'wrong', password: temporaryPassword, password_confirmation: temporaryPassword } });
  check(invalidChange.response.status === 422, 'wrong current password rejected');
  const mismatch = await request('/api/auth/password', { method: 'PUT', cookie: parentCookie, body: { current_password: originalPassword, password: temporaryPassword, password_confirmation: 'different' } });
  check(mismatch.response.status === 422, 'password confirmation enforced by backend');
  const changed = await request('/api/auth/password', { method: 'PUT', cookie: parentCookie, body: { current_password: originalPassword, password: temporaryPassword, password_confirmation: temporaryPassword } });
  passwordChanged = changed.response.status === 200;
  check(passwordChanged && changed.json.redirect === '/orang-tua', 'password change saved through Laravel');
  const restored = await request('/api/auth/password', { method: 'PUT', cookie: parentCookie, body: { current_password: temporaryPassword, password: originalPassword, password_confirmation: originalPassword } });
  check(restored.response.status === 200, 'new password works and demo password restored');
  passwordChanged = false;
  const admin = await request('/api/auth/login', { method: 'POST', body: { username: 'admin@example.com', password: 'AdminDev!2026', role: 'admin' } });
  check(admin.response.status === 200 && admin.json.redirect === '/akun', 'admin has a valid destination');
  cookies.push(admin.cookie);
  check((await request('/akun', { cookie: admin.cookie })).response.status === 200, 'admin account page renders');
} finally {
  if (passwordChanged) {
    const restored = await request('/api/auth/password', { method: 'PUT', cookie: parentCookie, body: { current_password: temporaryPassword, password: originalPassword, password_confirmation: originalPassword } });
    assert.equal(restored.response.status, 200, 'restore demo password');
  }
  for (const cookie of cookies.filter(Boolean)) {
    const logout = await request('/api/auth/logout', { method: 'POST', cookie });
    check(logout.response.status === 204, 'logout succeeds');
    check((await request('/api/me', { cookie })).response.status === 401, 'old token is revoked');
  }
}
console.log(`${checks} checks passed.`);
