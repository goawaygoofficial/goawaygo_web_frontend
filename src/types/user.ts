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
