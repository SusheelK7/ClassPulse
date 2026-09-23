export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least 1 uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least 1 number' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least 1 special character' };
  }
  return { valid: true };
}

export const PASSWORD_HINT = 'At least 8 characters with 1 uppercase, 1 number, and 1 special character';

export function getPasswordChecks(password) {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: '1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: '1 number', met: /[0-9]/.test(password) },
    { label: '1 special character', met: /[^A-Za-z0-9]/.test(password) },
  ];
}