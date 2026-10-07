/** A label/value row on the User Profile page. */
export interface ProfileDetail {
  label: string;
  value: string;
  /** Masks the value (e.g. password). */
  isSecret?: boolean;
}
