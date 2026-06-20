export function validatePassword(password) {
  if (!password || password.length <= 6) {
    return { valid: false, message: 'Password must be more than 6 characters' };
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

export const PASSWORD_HINT = 'More than 6 characters with 1 uppercase, 1 number, and 1 special character';
