/** One downloadable APK. */
export interface ApkFile {
  url: string;
  /** Bytes. */
  size: number;
  /** Hex SHA-256 of the file, so people can check what they downloaded. */
  sha256: string;
}

/** The newest Android build published for direct download (latest.json). */
export interface AndroidRelease {
  /** e.g. "1.0.0" */
  version: string;
  /** Build number; increases with every release. */
  build: number;
  /** Release date, YYYY-MM-DD. */
  date: string;
  notes: string;
  /** For 64-bit phones (nearly all phones in use). */
  arm64: ApkFile;
  /** For every phone, larger. */
  universal: ApkFile | null;
}
