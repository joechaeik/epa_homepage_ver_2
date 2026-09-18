declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    EPA_ADMIN_PASSWORD?: string;
    LOGIN_RATE_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  }
}
