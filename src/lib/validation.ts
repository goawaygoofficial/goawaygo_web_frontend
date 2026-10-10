/**
 * Same rule as the app's register screen: 8-72 chars with lowercase, uppercase, digit and special char.
 * 72 is the backend's limit (BCrypt only uses the first 72 bytes).
 */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,72}$/;

export const PASSWORD_RULE_MESSAGE =
  'Password must be 8 to 72 characters long and include uppercase, lowercase, number, and special character.';

export const REQUIRED_FIELDS_MESSAGE = 'Please fill all fields.';

export function isStrongPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}
