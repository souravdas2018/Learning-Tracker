// Author: Sourav Kumar Das
const required = [
  "PORT",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "JWT_SECRET",
  "FRONTEND_ORIGIN"
];

const missing = required.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error("Missing required environment variables:", missing.join(", "));
  console.error("Please create a .env file from backend/.env.example and set the values.");
  process.exit(1);
}

module.exports = true;
