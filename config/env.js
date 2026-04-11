import { config } from "dotenv";

// Get current environment (development or production)
const env = process.env.NODE_ENV || "development";

// Load the correct environment file
config({ path: `.env.${env}.local` });

// Also load base .env file as backup
config({ path: `.env` });

// Debug logging
console.log("🔧 Loading environment:", env);
console.log("📁 Loading file:", `.env.${env}.local`);

// Export all environment variables
export const { PORT, NODE_ENV, DB_URL, DB_USER, DB_PASS, DB_NAME } =
  process.env;

// Debug: Check if DB_URL is loaded
console.log("✅ DB_URL loaded:", !!DB_URL);
console.log("✅ NODE_ENV:", NODE_ENV);
