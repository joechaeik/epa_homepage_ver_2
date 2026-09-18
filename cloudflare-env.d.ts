declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    EPA_ADMIN_USER_ID?: string;
  }
}
