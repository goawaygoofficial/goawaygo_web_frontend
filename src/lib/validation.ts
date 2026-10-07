/** Same rule as the app's register screen: ≥ 8 chars with lowercase, uppercase, digit and special char. */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const PASSWORD_RULE_MESSAGE =
  'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';

export const REQUIRED_FIELDS_MESSAGE = 'Please fill all fields.';

export function isStrongPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}
