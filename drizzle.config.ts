import { defineConfig } from "drizzle-kit";

process.loadEnvFile(".env"); // node 22 stdlib, no dotenv dep

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
