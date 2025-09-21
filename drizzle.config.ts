import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./packages/drizzle",
  schema: "./packages/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
