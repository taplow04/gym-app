require("dotenv").config();

const required = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // Fail fast — a server without these cannot run safely.
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  mongoUri: process.env.MONGODB_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 30,
    refreshDaysShort: Number(process.env.JWT_REFRESH_EXPIRES_DAYS_SHORT) || 1,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    get configured() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },

  // Brevo HTTPS API key — preferred over SMTP in production (hosts like
  // Render block outbound SMTP ports; 443 always works).
  brevoApiKey: process.env.BREVO_API_KEY,

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || "Forge <no-reply@forge.app>",
    get configured() {
      return Boolean(this.host && this.user && this.pass);
    },
  },
};

module.exports = env;
