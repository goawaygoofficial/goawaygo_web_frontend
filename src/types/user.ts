/** User as the backend sends it (snake_case on the wire). */
export interface UserDto {
  id: number;
  name: string;
  email: string;
  profile_picture?: string | null;
  phone?: string | null;
  email_verified?: boolean;
  /** Reviews Wanderbook reports (set by hand in the database). */
  is_admin?: boolean;
  /** ISO 3166 country and ISO 4217 currency the user picked (4.6). */
  country?: string | null;
  currency?: string | null;
  /** Whether the account has a password; otherwise "confirm it's you" uses Google. */
  has_password?: boolean;
  google_linked?: boolean;
  /** A new email waiting for its confirmation link. */
  pending_email?: string | null;
}

/** User as the web app uses it. */
export interface User {
  id: number;
  name: string;
  email: string;
  profilePicture: string | null;
  phone: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  country: string | null;
  currency: string | null;
  hasPassword: boolean;
  googleLinked: boolean;
  pendingEmail: string | null;
}

export function userFromDto(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    profilePicture: dto.profile_picture ?? null,
    phone: dto.phone ?? null,
    emailVerified: dto.email_verified ?? false,
    isAdmin: dto.is_admin ?? false,
    country: dto.country ?? null,
    currency: dto.currency ?? null,
    // Older backends don't say: assume a password, which is what "confirm it's you" asked for before.
    hasPassword: dto.has_password ?? true,
    googleLinked: dto.google_linked ?? false,
    pendingEmail: dto.pending_email ?? null,
  };
}

/** Narrowing guard for untrusted JSON (API responses). */
export function isUserDto(value: unknown): value is UserDto {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string'
  );
}
